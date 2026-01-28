import React from 'react';
import { getCtaStats } from '@/app/services';
import CTASectionClient from './CTASectionClient';

export default async function CTASection() {
  const stats = await getCtaStats();
  return <CTASectionClient stats={stats} />;
}
