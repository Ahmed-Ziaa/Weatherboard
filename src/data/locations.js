export const locations = [
  {
    id: 'copenhagen',
    name: 'Copenhagen',
    country: 'Denmark',
    query: 'Copenhagen,DK',
    latitude: 55.6761,
    longitude: 12.5683,
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    query: 'Tokyo,JP',
    latitude: 35.6762,
    longitude: 139.6503,
  },
  {
    id: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    query: 'Lisbon,PT',
    latitude: 38.7223,
    longitude: -9.1393,
  },
  {
    id: 'oslo',
    name: 'Oslo',
    country: 'Norway',
    query: 'Oslo,NO',
    latitude: 59.9139,
    longitude: 10.7522,
  },
]

export const favouriteLocationIds = ['tokyo', 'lisbon', 'oslo']
export const favouriteLocations = locations.filter((location) =>
  favouriteLocationIds.includes(location.id),
)
