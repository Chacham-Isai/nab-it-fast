import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find all live auctions that have ended
    const { data: expiredAuctions, error: fetchError } = await supabase
      .from('auctions')
      .select('*, listings(id, title, seller_id, buy_now_price, starting_price)')
      .eq('status', 'live')
      .lt('ends_at', new Date().toISOString());

    if (fetchError) throw fetchError;
    if (!expiredAuctions || expiredAuctions.length === 0) {
      return new Response(JSON.stringify({ message: 'No expired auctions', closed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let closed = 0;

    for (const auction of expiredAuctions) {
      // Mark auction as ended
      await supabase
        .from('auctions')
        .update({ status: 'ended' })
        .eq('id', auction.id);

      // Mark listing as ended
      await supabase
        .from('listings')
        .update({ status: auction.highest_bidder_id ? 'sold' : 'ended' })
        .eq('id', auction.listing_id);

      // If there's a winner, create an order
      if (auction.highest_bidder_id && auction.listings) {
        const amount = auction.current_price;
        const platformFee = Math.round(amount * 0.10 * 100) / 100;

        await supabase.from('orders').insert({
          buyer_id: auction.highest_bidder_id,
          seller_id: auction.listings.seller_id,
          listing_id: auction.listing_id,
          auction_id: auction.id,
          amount,
          platform_fee: platformFee,
          status: 'pending',
        });

        // Award XP to winner
        const { data: winnerProfile } = await supabase
          .from('profiles')
          .select('total_xp')
          .eq('id', auction.highest_bidder_id)
          .single();
        
        if (winnerProfile) {
          await supabase
            .from('profiles')
            .update({ total_xp: (winnerProfile.total_xp || 0) + 100 })
            .eq('id', auction.highest_bidder_id);
        }

        // Notify winner
        await supabase.from('notifications_log').insert({
          user_id: auction.highest_bidder_id,
          title: '🎉 You won the auction! +100 XP',
          body: `You won "${auction.listings.title}" for $${amount.toLocaleString()}. Complete payment to claim your item.`,
          type: 'auction',
          action_label: 'Pay Now',
        });

        // Notify seller
        await supabase.from('notifications_log').insert({
          user_id: auction.listings.seller_id,
          title: '💰 Auction ended with a winner!',
          body: `"${auction.listings.title}" sold for $${amount.toLocaleString()}.`,
          type: 'auction',
          action_label: 'View Order',
        });
      } else {
        // No winner - notify seller
        if (auction.listings) {
          await supabase.from('notifications_log').insert({
            user_id: auction.listings.seller_id,
            title: 'Auction ended — no bids',
            body: `"${auction.listings.title}" ended with no bids. You can relist it.`,
            type: 'auction',
          });
        }
      }

      closed++;
    }

    return new Response(JSON.stringify({ message: `Closed ${closed} auctions`, closed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Close auctions error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
