"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import RoleDomainSelector from '@/components/auth/RoleDomainSelector';
import { useQueryClient } from '@tanstack/react-query';

const OnBoardingPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleComplete = async () => {
    await queryClient.invalidateQueries({ queryKey: ['userRole'] });
    router.push('/');
  };

  return (
    <RoleDomainSelector onComplete={handleComplete} />
  );
}

export default OnBoardingPage;