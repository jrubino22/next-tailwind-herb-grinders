import bcrypt from 'bcryptjs';

const data = {
  subproducts: [
    {
    option: 'size',
    variant: '55mm',
    parentId: '6361916359ea0c869ab9e8c7',
    image: 'none',
    sku: '1',
    price: 0,
    countInStock: 0,
    weight: 0,
    }
  ],
  banners: [
    {
      label: 'First Banner',
      image:
        'https://res.cloudinary.com/ddsp9kgde/image/upload/v1670366818/Blackfridaybanner1_1_bi5pyf.png',
      alt: 'black friday grinders',
      link: 'https://google.com',
      order: 1,
      live: 'true',
    },
    {
      label: 'Second Banner',
      image:
        'https://res.cloudinary.com/ddsp9kgde/image/upload/v1670366812/VSyndicate_BannerUpdate_1_1_zf2rzd.jpg',
      alt: 'grinders cheap',
      link: 'https://vsyndicate.com',
      order: 2,
      live: 'true',
    },
  ],
  users: [
    {
      name: 'Joey Rubino',
      email: 'developer@herbgrinders.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: true,
    },
    {
      name: 'Joey Test',
      email: 'joeyrubi22@gmail.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: false,
    },
  ],
  products: [
    {
      name: 'Smoky Night 4-Piece CleanCut Grinder',
      slug: 'smoky-night-4-piece-cleancut-grinder',
      category: '4-piece Grinders',
      image: '/images/smoky-night-4-piece-cleancut.png',
      price: 29.99,
      brand: 'V Syndicate',
      rating: 4.8,
      numReviews: 8,
      countInStock: 200,
      tags: '4-piece',
      id: 1,
      description:
        'Need a hit of creativity? Light up and let your creative juices flow with the Van Gogh CleanCut Grinder.',
    },
    {
      name: 'Game Head Grinder Card',
      slug: 'game-head-grinder-card',
      category: 'Grinder Cards',
      image: '/images/game-head-card.jpg',
      price: 9.99,
      brand: 'V Syndicate',
      rating: 4.7,
      numReviews: 5,
      countInStock: 100,
      tags: 'grinder-card',
      id: 2,
      description:
        'Take your grind to go and spark up with player 2. Our grinder cards are made with surgical-grade steel to effortlessly grate through herb. Plus, the nonstick coating prevents a sticky mess.',
    },
    {
      name: '420 Rasta 4-Piece SharpShred Grinder',
      slug: '420-rasta-4-piece-sharpshred-grinder',
      category: '4-piece Grinders',
      image: '/images/420-rasta-4-piece-sharpshred.png',
      price: 19.99,
      brand: 'V Syndicate',
      rating: 4.9,
      numReviews: 18,
      countInStock: 10,
      tags: '4-piece',
      id: 3,
      description:
        'Need a hit of creativity? Light up and let your creative juices flow with the Van Gogh CleanCut Grinder.',
    },
    {
      name: 'Smoky Night 4-Piece CleanCut Grinder',
      slug: 'smoky-night-4-piece-cleancut-grinder-2',
      category: '4-piece Grinders',
      image: '/images/smoky-night-4-piece-cleancut.png',
      price: 29.99,
      brand: 'V Syndicate',
      rating: 4.8,
      numReviews: 8,
      countInStock: 200,
      tags: '4-piece',
      id: 4,
      description:
        'Need a hit of creativity? Light up and let your creative juices flow with the Van Gogh CleanCut Grinder.',
    },
    {
      name: 'Game Head Grinder Card',
      slug: 'game-head-grinder-card-2',
      category: 'Grinder Cards',
      image: '/images/game-head-card.jpg',
      price: 9.99,
      brand: 'V Syndicate',
      rating: 4.7,
      numReviews: 5,
      countInStock: 100,
      tags: 'grinder-card',
      id: 5,
      description:
        'Take your grind to go and spark up with player 2. Our grinder cards are made with surgical-grade steel to effortlessly grate through herb. Plus, the nonstick coating prevents a sticky mess.',
    },
    {
      name: '420 Rasta 4-Piece SharpShred Grinder',
      slug: '420-rasta-4-piece-sharpshred-grinder-2',
      category: '4-piece Grinders',
      image: '/images/420-rasta-4-piece-sharpshred.png',
      price: 19.99,
      brand: 'V Syndicate',
      rating: 4.9,
      numReviews: 18,
      countInStock: 20,
      tags: '4-piece',
      id: 6,
      description:
        'Need a hit of creativity? Light up and let your creative juices flow with the Van Gogh CleanCut Grinder.',
    },
  ],
};

export default data;
