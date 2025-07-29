import React from 'react';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

const LiveTokens = () => {
  const tokens = [
    {
      id: 1,
      name: 'Dogenald',
      symbol: 'DOGE',
      score: 92,
      creator: 'mememaster',
      image: '🐕',
      change: '+12.5%',
      trending: 'up'
    },
    {
      id: 2,
      name: 'Cate',
      symbol: 'CATE',
      score: 76,
      creator: 'whiskers',
      image: '🐱',
      change: '+8.2%',
      trending: 'up'
    },
    {
      id: 3,
      name: 'Based Pepe',
      symbol: 'PEPE',
      score: 63,
      creator: 'dankforce',
      image: '🐸',
      change: '-2.1%',
      trending: 'down'
    },
    {
      id: 4,
      name: 'Cheems',
      symbol: 'CHEEMS',
      score: 42,
      creator: 'suchyow',
      image: '🐕',
      change: '+5.7%',
      trending: 'up'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

};

export default LiveTokens;