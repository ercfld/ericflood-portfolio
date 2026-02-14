export const site = {
  name: 'ERIC FLOOD',
};

export const social = {
  instagram: {
    handle: 'ercflud',
    url: 'https://instagram.com/ercflud',
    // To show latest posts in bio, sign up at https://behold.so (free tier),
    // connect your Instagram, create a feed, and paste the feed URL here:
    feedUrl: '',
  },
};

export const projects = [
  {
    slug: 'kathmandu-valley',
    title: 'Kathmandu Valley',
    category: 'Stories',
    images: [
      { file: '1.jpg' },
      { file: '2.jpg' },
      { file: '3.jpg' },
      { file: '4.jpg' },
      { file: '5.jpg' },
      { file: '7.jpg' },
      { file: '8.jpg' },
      { file: '9.jpg' },
      { file: '10.jpg' },
      { file: '11.jpg' },
      { file: '12.jpg' },
      { file: '13.jpg' },
    ],
  },
];

export function imagePath(slug, file) {
  return `/photos/${slug}/${file}`;
}
