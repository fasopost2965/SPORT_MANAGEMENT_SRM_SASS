/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
// @ts-ignore
import ndemboLogo from '../assets/images/ndembo_logo_1782733437136.jpg';

interface NdemboKinLogoProps {
  className?: string;
  showText?: boolean;
  lightText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const NDEMBO_KIN_OFFICIAL_LOGO = ndemboLogo;

export default function NdemboKinLogo({ 
  className = '', 
  showText = true, 
  lightText = false,
  size = 'md' 
}: NdemboKinLogoProps) {
  
  // Dimensions based on size prop
  const dimensions = {
    sm: { width: 48, height: 48 },
    md: { width: 100, height: 100 },
    lg: { width: 180, height: 180 },
    xl: { width: 320, height: 320 },
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`} id="ndembo_kin_logo_container">
      <img
        src={NDEMBO_KIN_OFFICIAL_LOGO}
        alt="Ndembo Kin Sport Management"
        style={{ width: dimensions.width, height: dimensions.height }}
        className="object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
