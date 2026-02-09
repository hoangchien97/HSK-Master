import { getHeroSlides } from '@/services';
import HeroSlideShowClient from './HeroSlideShowClient';

export default async function HeroSlideShow() {
  const slides = await getHeroSlides();

  return <HeroSlideShowClient slides={slides} />;
}
