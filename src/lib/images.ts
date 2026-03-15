// Shared category image map — photorealistic AI-generated assets
import imgCards from "@/assets/categories/cards.png";
import imgSneakers from "@/assets/categories/sneakers.png";
import imgWatches from "@/assets/categories/watches.png";
import imgElectronics from "@/assets/categories/electronics.png";
import imgFashion from "@/assets/categories/fashion.png";
import imgCollectibles from "@/assets/categories/collectibles.png";
import imgVinyl from "@/assets/categories/vinyl.png";
import imgGaming from "@/assets/categories/gaming.png";

import imgBreaks from "@/assets/modes/breaks.png";
import imgGrabBags from "@/assets/modes/grab-bags.png";
import imgAuctions from "@/assets/modes/auctions.png";
import imgDreamBuys from "@/assets/modes/dream-buys.png";
import imgCommunity from "@/assets/modes/community.png";
import imgEmptyState from "@/assets/modes/empty-state.png";

export const categoryImages: Record<string, string> = {
  Cards: imgCards,
  cards: imgCards,
  Sneakers: imgSneakers,
  sneakers: imgSneakers,
  Watches: imgWatches,
  watches: imgWatches,
  Electronics: imgElectronics,
  electronics: imgElectronics,
  Fashion: imgFashion,
  fashion: imgFashion,
  Collectibles: imgCollectibles,
  collectibles: imgCollectibles,
  Vinyl: imgVinyl,
  vinyl: imgVinyl,
  Gaming: imgGaming,
  gaming: imgGaming,
  Music: imgVinyl,
  music: imgVinyl,
};

export const modeImages = {
  breaks: imgBreaks,
  grabBags: imgGrabBags,
  auctions: imgAuctions,
  dreamBuys: imgDreamBuys,
  community: imgCommunity,
  emptyState: imgEmptyState,
};

export const getCategoryImage = (category: string): string => {
  return categoryImages[category] || categoryImages.Cards;
};

export const guessItemImage = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes("jordan") || lower.includes("nike") || lower.includes("dunk") || lower.includes("sneaker") || lower.includes("yeezy") || lower.includes("shoe")) return imgSneakers;
  if (lower.includes("rolex") || lower.includes("watch") || lower.includes("omega") || lower.includes("casio") || lower.includes("seiko")) return imgWatches;
  if (lower.includes("topps") || lower.includes("prizm") || lower.includes("psa") || lower.includes("card") || lower.includes("pokemon") || lower.includes("charizard")) return imgCards;
  if (lower.includes("iphone") || lower.includes("macbook") || lower.includes("ps5") || lower.includes("xbox") || lower.includes("gpu") || lower.includes("vr") || lower.includes("vision")) return imgElectronics;
  if (lower.includes("vinyl") || lower.includes("record") || lower.includes("album")) return imgVinyl;
  if (lower.includes("bag") || lower.includes("louis") || lower.includes("gucci") || lower.includes("supreme") || lower.includes("fashion")) return imgFashion;
  if (lower.includes("gaming") || lower.includes("controller") || lower.includes("keyboard")) return imgGaming;
  if (lower.includes("trophy") || lower.includes("figure") || lower.includes("collectible") || lower.includes("funko")) return imgCollectibles;
  return imgCards;
};
