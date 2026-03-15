import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const { auction_id, amount, bid_type = 'manual', max_proxy_amount } = await req.json();

    // Fetch auction
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auction_id)
      .single();

    if (auctionError || !auction) throw new Error('Auction not found');
    if (auction.status !== 'live') throw new Error('Auction is not live');

    // Check if auction has ended
    if (new Date(auction.ends_at) < new Date()) {
      throw new Error('Auction has ended');
    }

    // Validate bid amount
    const minBid = auction.current_price + auction.bid_increment;
    if (amount < minBid) {
      throw new Error(`Minimum bid is $${minBid}`);
    }

    // Can't bid on own auction
    const { data: listing } = await supabase
      .from('listings')
      .select('seller_id')
      .eq('id', auction.listing_id)
      .single();

    if (listing?.seller_id === user.id) {
      throw new Error('Cannot bid on your own auction');
    }

    // Place the bid
    const { error: bidError } = await supabase.from('bids').insert({
      auction_id,
      bidder_id: user.id,
      amount,
      bid_type,
      max_proxy_amount: bid_type === 'proxy' ? max_proxy_amount : null,
    });

    if (bidError) throw new Error('Failed to place bid');

    // Update auction state
    const previousBidderId = auction.highest_bidder_id;

    await supabase
      .from('auctions')
      .update({
        current_price: amount,
        highest_bidder_id: user.id,
        bid_count: auction.bid_count + 1,
      })
      .eq('id', auction_id);

    // Auto-extend if less than 2 minutes remaining
    if (auction.auto_extend) {
      const timeLeft = new Date(auction.ends_at).getTime() - Date.now();
      if (timeLeft < 120000) { // 2 minutes
        const newEnd = new Date(Date.now() + 120000).toISOString();
        await supabase
          .from('auctions')
          .update({ ends_at: newEnd })
          .eq('id', auction_id);
      }
    }

    // Notify previous highest bidder they've been outbid
    if (previousBidderId && previousBidderId !== user.id) {
      await supabase.from('notifications_log').insert({
        user_id: previousBidderId,
        title: 'You've been outbid! 😱',
        body: `Someone placed a higher bid of $${amount}. Bid again to stay in the game!`,
        type: 'auction',
        action_label: 'Bid Again',
      });
    }

    return new Response(JSON.stringify({
      success: true,
      new_price: amount,
      bid_count: auction.bid_count + 1,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
