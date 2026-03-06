import { ExternalLink } from '../components/ExternalLink';
import { LinkedInIcon } from '../components/icons/LinkedInIcon';
import goluBaby from '../images/logos/goluBaby.png'
import bachaToys from '../images/logos/bachaToys.png'
import juniorLand from '../images/logos/juniorLand.png'

export const Name = 'Malaika Nisar';

export const About = (
  <>
    {`I'm a results-driven Digital Marketer driving growth through data & creativity. If you'd like to get in touch,`}{' '}
    <ExternalLink href="mailto:malaikaanisar2521@gmail.com">send me an email.</ExternalLink>
  </>
);
export const AboutExtended = `I am a results-driven Social Media Marketing Specialist with experience in developing and executing data-driven digital strategies that enhance brand visibility and drive engagement. With a strong understanding of content marketing, paid advertising, and performance analytics, I focus on creating campaigns that not only attract audiences but also convert them into loyal customers. I have hands-on experience managing social media platforms, running targeted ad campaigns, analyzing key performance metrics, and optimizing strategies to maximize ROI. My approach combines creativity with analytical thinking to deliver measurable growth and consistent brand presence. I am passionate about helping businesses grow in the digital landscape and continuously improving my skills to stay ahead of evolving marketing trends. I am currently pursuing a Bachelor of Science in Information Technology at The Islamia University of Bahawalpur (2024–2028).`;

export type Project = {
  title: string;
  techStack: string[];
  description: string;
  logo: any;
  link?: {
    label: string;
    href: string;
  };
};

export const MyCurrentProjects: Project[] = [
  {
    title: 'Bacha Toys',
    techStack: ['Social Media', 'Content Management', 'Shopify', 'Ad Campaigns'],
    description:
      "Pakistan's #1 toy store. I manage social media, run ad campaigns, and handle the Shopify website to drive sales and brand growth.",
    logo: bachaToys,
    link: {
      label: 'bachatoys.com',
      href: 'https://bachatoys.com',
    },
  },
  {
    title: 'Junior Land',
    techStack: ['Social Media', 'Content Management', 'Shopify', 'Ad Campaigns'],
    description:
      "A leading toy store in Pakistan. I manage social media presence, run marketing campaigns, and maintain the Shopify e-commerce store.",
    logo: juniorLand,
    link: {
      label: 'juniorland.store',
      href: 'https://juniorland.store',
    },
  },
  {
    title: 'Golu Baby',
    techStack: ['Social Media', 'Content Management', 'Shopify', 'Ad Campaigns'],
    description:
      "A top toy brand in Pakistan. I handle content creation, social media marketing, campaign management, and Shopify store operations.",
    logo: goluBaby,
    link: {
      label: 'golubaby.com',
      href: 'https://golubaby.com',
    },
  },
];

export const MyPastProjects: Project[] = [];

export const SocialMedia = [
  { name: 'LinkedIn', link: 'https://www.linkedin.com/in/malaikaanisar', icon: LinkedInIcon },
] as const;

export const Work = [
  {
    company: 'Bacha Toys',
    title: 'Content Manager & Social Media Marketer',
    logo: undefined,
    start: 'Sep 2024',
    end: 'Present',
  },
  {
    company: 'Junior Land',
    title: 'Content Manager & Social Media Marketer',
    logo: undefined,
    start: 'Sep 2024',
    end: 'Present',
  },
  {
    company: 'Golu Baby',
    title: 'Content Manager & Social Media Marketer',
    logo: undefined,
    start: 'Sep 2024',
    end: 'Present',
  },
  {
    company: 'G-Tech Solutions',
    title: 'Social Media Marketing Specialist',
    logo: undefined,
    start: 'May 2024',
    end: 'Aug 2024',
  },
] as const;

export const CompaniesLinks = [
  {
    name: 'Bacha Toys',
    link: 'https://bachatoys.com',
  },
  {
    name: 'Junior Land',
    link: 'https://juniorland.store',
  },
  {
    name: 'Golu Baby',
    link: 'https://golubaby.com',
  },
  {
    name: 'G-Tech Solutions',
    link: 'https://www.facebook.com/gtechacademyryk/',
  },
] as const;

export const Books = [
  {
    name: 'Building a StoryBrand by Donald Miller',
    link: 'https://www.amazon.com/Building-StoryBrand-Clarify-Message-Customers/dp/0718033329',
  },
  {
    name: 'Contagious: Why Things Catch On by Jonah Berger',
    link: 'https://www.amazon.com/Contagious-Things-Catch-Jonah-Berger/dp/1451686579',
  },
  {
    name: 'Influence: The Psychology of Persuasion by Robert B. Cialdini',
    link: 'https://www.amazon.com/Influence-Psychology-Persuasion-Robert-Cialdini/dp/006124189X',
  },
  {
    name: 'Jab, Jab, Jab, Right Hook by Gary Vaynerchuk',
    link: 'https://www.amazon.com/Jab-Right-Hook-Story-Social/dp/006227306X',
  },
  {
    name: 'This Is Marketing by Seth Godin',
    link: 'https://www.amazon.com/This-Marketing-Cant-Until-Learn/dp/0525540830',
  },
] as const;

export const VideosWorthWatching = [
  {
    name: 'How to Make Your Brand Stand Out on Social Media — Gary Vee',
    link: 'https://www.youtube.com/watch?v=ZNvCN3-QL_c',
  },
  {
    name: 'The Psychology of Digital Marketing — Philip Kotler',
    link: 'https://www.youtube.com/watch?v=sR-qL7QdVZQ',
  },
] as const;

export const Podcasts = [
  {
    name: 'Marketing School — Neil Patel & Eric Siu',
    link: 'https://marketingschool.io/',
  },
  {
    name: 'The GaryVee Audio Experience',
    link: 'https://www.youtube.com/@garyvee',
  },
  {
    name: 'Social Media Marketing Podcast — Michael Stelzner',
    link: 'https://www.socialmediaexaminer.com/shows/',
  },
] as const;

export const PeopleWorthFollowingOnTwitter = [
  {
    name: 'Gary Vaynerchuk',
    link: 'https://twitter.com/garyvee',
  },
  {
    name: 'Neil Patel',
    link: 'https://twitter.com/neilpatel',
  },
  {
    name: 'Seth Godin',
    link: 'https://twitter.com/ThisIsSethsBlog',
  },
  {
    name: 'Rand Fishkin',
    link: 'https://twitter.com/randfish',
  },
  {
    name: 'Ann Handley',
    link: 'https://twitter.com/MarketingProfs',
  },
  {
    name: 'Jay Baer',
    link: 'https://twitter.com/jaybaer',
  },
] as const;

export const Blogs = [
  {
    name: 'Neil Patel Blog',
    link: 'https://neilpatel.com/blog/',
  },
  {
    name: 'HubSpot Marketing Blog',
    link: 'https://blog.hubspot.com/marketing',
  },
  {
    name: 'Social Media Examiner',
    link: 'https://www.socialmediaexaminer.com/',
  },
  {
    name: 'Content Marketing Institute',
    link: 'https://contentmarketinginstitute.com/',
  },
  {
    name: 'Buffer Blog',
    link: 'https://buffer.com/resources/',
  },
] as const;

export const Quotes = [
  {
    content: 'Content is fire. Social media is gasoline.',
    author: '― Jay Baer',
  },
  {
    content: 'Marketing is no longer about the stuff that you make, but about the stories you tell.',
    author: '― Seth Godin',
  },
  {
    content: 'People do not buy goods and services. They buy relations, stories and magic.',
    author: '― Seth Godin',
  },
  {
    content: "The best marketing doesn't feel like marketing.",
    author: '― Tom Fishburne',
  },
  {
    content: 'Your brand is a story unfolding across all customer touchpoints.',
    author: '― Jonah Sachs',
  },
  {
    content:
      'Good marketing makes the company look smart. Great marketing makes the customer feel smart.',
    author: '― Joe Chernov',
  },
  {
    content: "Don't be afraid to get creative and experiment with your marketing.",
    author: '― Mike Volpe',
  },
  {
    content:
      'The aim of marketing is to know and understand the customer so well the product or service fits him and sells itself.',
    author: '― Peter Drucker',
  },
] as const;

export const Tools = {
  'Marketing Platforms': [
    {
      title: 'Meta Business Suite',
      description:
        'Essential for managing Facebook and Instagram business pages, scheduling posts, running ads, and analyzing audience insights all in one place.',
      href: 'https://business.facebook.com/',
      logo: 'https://cdn.simpleicons.org/meta/white',
      logoBg: '#1877F2',
    },
    {
      title: 'Google Analytics',
      description:
        'The go-to tool for tracking website traffic, user behavior, and conversion metrics to make data-driven marketing decisions.',
      href: 'https://analytics.google.com/',
      logo: 'https://cdn.simpleicons.org/googleanalytics/white',
      logoBg: '#E37400',
    },
    {
      title: 'Canva',
      description:
        'My favorite design tool for creating social media graphics, stories, presentations, and marketing materials quickly and beautifully.',
      href: 'https://www.canva.com/',
      logo: 'https://www.google.com/s2/favicons?domain=canva.com&sz=128',
      logoBg: '#00C4CC',
    },
    {
      title: 'Hootsuite',
      description:
        'Helps me schedule and manage social media posts across multiple platforms, monitor engagement, and track performance.',
      href: 'https://www.hootsuite.com/',
      logo: 'https://cdn.simpleicons.org/hootsuite/white',
      logoBg: '#143059',
    },
  ],
  'Content & SEO': [
    {
      title: 'Google Search Console',
      description:
        'Crucial for monitoring website search performance, indexing status, and optimizing content for organic search visibility.',
      href: 'https://search.google.com/search-console',
      logo: 'https://cdn.simpleicons.org/googlesearchconsole/white',
      logoBg: '#458CF5',
    },
    {
      title: 'ChatGPT',
      description:
        'I use AI to brainstorm content ideas, draft copy, and speed up content creation workflows.',
      href: 'https://chat.openai.com/',
      logo: 'https://www.google.com/s2/favicons?domain=chat.openai.com&sz=128',
      logoBg: '#10A37F',
    },
    {
      title: 'Mailchimp',
      description:
        'Great for email marketing campaigns, audience segmentation, and automated email workflows to nurture leads.',
      href: 'https://mailchimp.com/',
      logo: 'https://cdn.simpleicons.org/mailchimp/white',
      logoBg: '#241C15',
    },
    {
      title: 'Notion',
      description:
        'I use it to plan content calendars, organize campaign briefs, and keep track of all my marketing projects.',
      href: 'https://www.notion.so/',
      logo: 'https://cdn.simpleicons.org/notion/white',
      logoBg: '#000000',
    },
  ],
} as const;
