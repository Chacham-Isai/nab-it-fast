
CREATE OR REPLACE FUNCTION public.notify_deal_milestone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prev_pct float;
  new_pct float;
  participant record;
  deal_row record;
BEGIN
  SELECT * INTO deal_row FROM public.group_deals WHERE id = NEW.deal_id;
  IF NOT FOUND THEN RETURN NEW; END IF;

  prev_pct := (deal_row.current_participants - 1)::float / deal_row.target_participants;
  new_pct := deal_row.current_participants::float / deal_row.target_participants;

  IF prev_pct < 0.8 AND new_pct >= 0.8 AND deal_row.status = 'active' THEN
    FOR participant IN
      SELECT user_id FROM public.group_deal_participants WHERE deal_id = NEW.deal_id AND user_id != NEW.user_id
    LOOP
      INSERT INTO public.notifications_log (user_id, type, title, body, action_label)
      VALUES (
        participant.user_id,
        'deal_milestone',
        '🔥 Almost there!',
        deal_row.emoji || ' ' || deal_row.title || ' is 80% funded — just a few more needed!',
        'View Deal'
      );
    END LOOP;
  END IF;

  IF deal_row.status = 'funded' THEN
    FOR participant IN
      SELECT user_id FROM public.group_deal_participants WHERE deal_id = NEW.deal_id
    LOOP
      INSERT INTO public.notifications_log (user_id, type, title, body, action_label)
      VALUES (
        participant.user_id,
        'deal_funded',
        '🎉 Deal Funded!',
        deal_row.emoji || ' ' || deal_row.title || ' hit its target! You''re in!',
        'View Deal'
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_deal_participant_notify
  AFTER INSERT ON public.group_deal_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_deal_milestone();
