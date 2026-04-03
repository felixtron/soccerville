export const VENUES = {
  metepec: {
    name: "Metepec",
    address: "Metepec, Estado de Mexico",
    phone: "55 1234 5678",
    whatsapp: "5215551234567",
    hours: "Lunes a Domingo",
    lat: 19.2408487,
    lng: -99.5783368,
    placeId: "ChIJnQ37C3KLzYURBViAAiHs3Ec",
    mapsUrl:
      "https://www.google.com/maps/place/Soccerville+Metepec/@19.2408487,-99.5783368,17z/",
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3764.5!2d-99.5783368!3d19.2408487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85cd8b720bfb0d9d%3A0x47dcec2102805805!2sSoccerville%20Metepec!5e0!3m2!1ses!2smx!4v1",
  },
  calimaya: {
    name: "Calimaya",
    address: "Calimaya, Estado de Mexico",
    phone: "55 8765 4321",
    whatsapp: "5215551234567",
    hours: "Lunes a Domingo",
    lat: 19.1756911,
    lng: -99.5983876,
    placeId: "ChIJWYU6uNmNzYUR-aJnr181uRk",
    mapsUrl:
      "https://www.google.com/maps/place/SoccerVille+Calimaya/@19.1756911,-99.5983876,17z/",
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3765.5!2d-99.5983876!3d19.1756911!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85cd8dd9b83a8559%3A0x19b9355faf67a2f9!2sSoccerVille%20Calimaya!5e0!3m2!1ses!2smx!4v1",
  },
} as const;

export type VenueKey = keyof typeof VENUES;
