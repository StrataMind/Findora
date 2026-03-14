import { prisma } from "./prisma";

export async function getArtwork() {
  try {
    const artworks = await prisma.artwork.findMany({
      orderBy: { createdAt: "desc" },
    });
    return artworks;
  } catch (error) {
    console.error("Failed to fetch artwork:", error);
    return [];
  }
}

export async function getArtworkById(id: string) {
  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id },
    });
    return artwork;
  } catch (error) {
    console.error("Failed to fetch artwork:", error);
    return null;
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}
