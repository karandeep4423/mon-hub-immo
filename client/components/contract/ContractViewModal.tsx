import React, { useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ContractViewModalProps {
	isOpen: boolean;
	onClose: () => void;
	contractText: string;
	collaboration: {
		postOwnerId: {
			firstName: string;
			lastName: string;
		};
		collaboratorId: {
			firstName: string;
			lastName: string;
		};
		proposedCommission: number;
		ownerSigned: boolean;
		ownerSignedAt?: string;
		collaboratorSigned: boolean;
		collaboratorSignedAt?: string;
		createdAt: string;
	};
}

export const ContractViewModal: React.FC<ContractViewModalProps> = ({
	isOpen,
	onClose,
	contractText,
	collaboration,
}) => {
	const printRef = useRef<HTMLDivElement>(null);

	const handlePrint = () => {
		const printWindow = window.open('', '', 'width=800,height=600');
		if (!printWindow) return;

		const printContent = printRef.current?.innerHTML || '';

		printWindow.document.write(`
			<!DOCTYPE html>
			<html>
				<head>
					<title>Contrat de Collaboration</title>
					<style>
						body {
							font-family: Arial, sans-serif;
							line-height: 1.6;
							color: #333;
							max-width: 800px;
							margin: 0 auto;
							padding: 20px;
						}
						h1 {
							color: #0ea5e9;
							border-bottom: 2px solid #0ea5e9;
							padding-bottom: 10px;
							margin-bottom: 20px;
						}
						h2 {
							color: #0284c7;
							margin-top: 30px;
							margin-bottom: 15px;
						}
						.contract-header {
							text-align: center;
							margin-bottom: 40px;
						}
						.contract-parties {
							background: #f0f9ff;
							padding: 20px;
							border-radius: 8px;
							margin: 20px 0;
						}
						.contract-content {
							white-space: pre-wrap;
							line-height: 1.8;
						}
						.signatures {
							margin-top: 40px;
							display: grid;
							grid-template-columns: 1fr 1fr;
							gap: 30px;
						}
						.signature-block {
							border: 1px solid #e5e7eb;
							padding: 20px;
							border-radius: 8px;
						}
						.signature-status {
							display: inline-block;
							padding: 4px 12px;
							border-radius: 9999px;
							font-size: 14px;
							font-weight: 600;
							margin-top: 10px;
						}
						.signed {
							background: #dcfce7;
							color: #166534;
						}
						.pending {
							background: #fef3c7;
							color: #854d0e;
						}
						@media print {
							body {
								padding: 0;
							}
							.no-print {
								display: none;
							}
						}
					</style>
				</head>
				<body>
					${printContent}
				</body>
			</html>
		`);

		printWindow.document.close();
		printWindow.focus();

		// Wait for content to load, then print
		setTimeout(() => {
			printWindow.print();
			printWindow.close();
		}, 250);
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	};

	// Parse and format contract text for better display
	const formatContractText = (text: string) => {
		if (!text) return null;

		// Find all ARTICLE headers
		const articleMatches = text.match(/ARTICLE \d+[^A-Z]*/gi);

		if (articleMatches && articleMatches.length > 0) {
			// Contract has ARTICLE structure
			return (
				<div className="space-y-6">
					{text.split(/(ARTICLE \d+[^\n]*)/gi).map((part, index) => {
						if (part.match(/ARTICLE \d+/i)) {
							// This is an article header
							return (
								<h3
									key={index}
									className="text-lg font-bold text-brand-600 mt-6 mb-2"
								>
									{part.trim()}
								</h3>
							);
						} else if (part.trim()) {
							// This is article content
							return (
								<div
									key={index}
									className="text-gray-700 leading-relaxed pl-4 border-l-2 border-brand-200"
								>
									{part
										.trim()
										.split('\n')
										.map((line, i) => {
											if (line.trim().startsWith('-')) {
												return (
													<li
														key={i}
														className="ml-4 mb-2"
													>
														{line
															.trim()
															.substring(1)
															.trim()}
													</li>
												);
											}
											return (
												line.trim() && (
													<p key={i} className="mb-3">
														{line.trim()}
													</p>
												)
											);
										})}
								</div>
							);
						}
						return null;
					})}
				</div>
			);
		} else {
			// Simple paragraph formatting
			return (
				<div className="space-y-4">
					{text.split('\n').map((paragraph, index) => {
						const trimmed = paragraph.trim();
						if (!trimmed) return null;

						// Check if it's a heading (all caps or starts with number)
						if (
							trimmed.match(/^[A-Z\s]{10,}/) ||
							trimmed.match(/^\d+[\.\)]/)
						) {
							return (
								<h3
									key={index}
									className="text-base font-bold text-brand-600 mt-4 mb-2"
								>
									{trimmed}
								</h3>
							);
						}

						// Check if it's a list item
						if (trimmed.startsWith('-') || trimmed.match(/^[•·]/)) {
							return (
								<li
									key={index}
									className="ml-6 text-gray-700 leading-relaxed mb-2"
								>
									{trimmed.replace(/^[-•·]\s*/, '')}
								</li>
							);
						}

						return (
							<p
								key={index}
								className="text-gray-700 leading-relaxed"
							>
								{trimmed}
							</p>
						);
					})}
				</div>
			);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="📄 Contrat de Collaboration"
		>
			<div className="space-y-6">
				{/* Printable Content */}
				<div ref={printRef} className="print-content">
					<div className="contract-header">
						<h1>Contrat de Collaboration Immobilière</h1>
						<p style={{ color: '#6b7280', marginTop: '10px' }}>
							MonHubImmo - Plateforme de collaboration
						</p>
					</div>

					{/* Parties */}
					<div className="bg-brand-50 rounded-lg p-6 border border-brand-200">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							👥 Entre les parties
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="bg-white rounded-lg p-4 border border-gray-200">
								<p className="text-sm text-gray-600 mb-1">
									Propriétaire
								</p>
								<p className="font-semibold text-gray-900">
									{collaboration.postOwnerId.firstName}{' '}
									{collaboration.postOwnerId.lastName}
								</p>
								<span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
									Agent Propriétaire
								</span>
							</div>
							<div className="bg-white rounded-lg p-4 border border-gray-200">
								<p className="text-sm text-gray-600 mb-1">
									Collaborateur
								</p>
								<p className="font-semibold text-gray-900">
									{collaboration.collaboratorId.firstName}{' '}
									{collaboration.collaboratorId.lastName}
								</p>
								<span className="inline-block mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
									Agent Apporteur
								</span>
							</div>
						</div>
					</div>

					{/* Contract Content */}
					<div className="contract-content">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							📋 Termes du contrat
						</h2>
						<div className="mt-4 max-h-96 overflow-y-auto pr-4 bg-white rounded-lg border border-gray-200 p-6">
							{contractText ? (
								formatContractText(contractText)
							) : (
								<p className="text-gray-500 italic">
									Aucun contenu de contrat disponible.
								</p>
							)}
						</div>
					</div>

					{/* Commission */}
					<div className="bg-brand-50 rounded-lg p-6 border border-brand-200">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							💰 Répartition des commissions
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="bg-white rounded-lg p-4 border-2 border-blue-200">
								<p className="text-sm text-gray-600 mb-1">
									Agent propriétaire
								</p>
								<p className="text-3xl font-bold text-blue-600">
									{100 - collaboration.proposedCommission}%
								</p>
							</div>
							<div className="bg-white rounded-lg p-4 border-2 border-green-200">
								<p className="text-sm text-gray-600 mb-1">
									Agent apporteur
								</p>
								<p className="text-3xl font-bold text-green-600">
									{collaboration.proposedCommission}%
								</p>
							</div>
						</div>
					</div>

					{/* Signatures */}
					<div className="mt-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							✍️ Signatures
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
								<p className="text-sm text-gray-600 mb-2">
									Propriétaire
								</p>
								<p className="font-semibold text-gray-900 mb-3">
									{collaboration.postOwnerId.firstName}{' '}
									{collaboration.postOwnerId.lastName}
								</p>
								<span
									className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
										collaboration.ownerSigned
											? 'bg-green-100 text-green-800'
											: 'bg-yellow-100 text-yellow-800'
									}`}
								>
									{collaboration.ownerSigned
										? '✓ Signé'
										: '⏳ En attente'}
								</span>
								{collaboration.ownerSigned &&
									collaboration.ownerSignedAt && (
										<p className="text-xs text-gray-500 mt-2">
											Signé le:{' '}
											{formatDate(
												collaboration.ownerSignedAt,
											)}
										</p>
									)}
							</div>
							<div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
								<p className="text-sm text-gray-600 mb-2">
									Collaborateur
								</p>
								<p className="font-semibold text-gray-900 mb-3">
									{collaboration.collaboratorId.firstName}{' '}
									{collaboration.collaboratorId.lastName}
								</p>
								<span
									className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
										collaboration.collaboratorSigned
											? 'bg-green-100 text-green-800'
											: 'bg-yellow-100 text-yellow-800'
									}`}
								>
									{collaboration.collaboratorSigned
										? '✓ Signé'
										: '⏳ En attente'}
								</span>
								{collaboration.collaboratorSigned &&
									collaboration.collaboratorSignedAt && (
										<p className="text-xs text-gray-500 mt-2">
											Signé le:{' '}
											{formatDate(
												collaboration.collaboratorSignedAt,
											)}
										</p>
									)}
							</div>
						</div>
					</div>

					<div className="mt-8 pt-6 border-t border-gray-200 text-center">
						<p className="text-xs text-gray-500">
							Contrat généré le{' '}
							{formatDate(collaboration.createdAt)} via la
							plateforme MonHubImmo
						</p>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-3 pt-4 border-t border-gray-200 no-print">
					<Button
						onClick={handlePrint}
						className="flex-1 bg-brand hover:bg-brand-dark"
					>
						<svg
							className="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
							/>
						</svg>
						Télécharger PDF
					</Button>
					<Button
						onClick={onClose}
						variant="outline"
						className="flex-1"
					>
						Fermer
					</Button>
				</div>
			</div>
		</Modal>
	);
};
