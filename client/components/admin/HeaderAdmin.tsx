'use client';
import React from 'react';

interface HeaderAdminProps {
	onMenuToggle?: () => void;
	menuOpen?: boolean;
}

// HeaderAdmin has been deprecated in favor of the main application header.
// To avoid accidental rendering of two headers, this component is now a no-op.
export const HeaderAdmin: React.FC<HeaderAdminProps> = () => {
	return null;
};

export default HeaderAdmin;
