import React from 'react';
import { toTitleCase, formatFieldValue } from '@/utils/formatters';

export const PrintableOrganizationForm = ({ org }) => {
    if (!org) return null;

    const isNGO = org.isNGO;
    const ngoDetails = org.ngoDetails || {};
    const companyDetails = org.companyDetails || {};
    const contactDetails = org.contactDetails || {};
    const refId = org._id ? `ORG-${org._id.slice(-6).toUpperCase()}` : 'REG-FORM';
    const printDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    return (
        <div id="printable-form" className="printable-document bg-white text-black p-8 font-serif max-w-4xl mx-auto border-2 border-black my-4">
            
            {/* Formal Header */}
            <div className="border-b-2 border-black pb-4 mb-6 text-center">
                <div className="flex justify-between items-center mb-2 text-xs font-mono font-bold uppercase tracking-wider text-gray-600 border-b border-gray-300 pb-1">
                    <span>Reference ID: {refId}</span>
                    <span>Printed On: {printDate}</span>
                </div>
                <h1 className="text-2xl font-bold uppercase tracking-widest text-black mb-1">True Path Foundation</h1>
                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Official Organization Verification Record</h2>
                <div className="mt-2 inline-block px-4 py-1 border border-black font-mono text-xs font-bold uppercase">
                    Status: {org.verificationStatus ? org.verificationStatus.toUpperCase() : 'PENDING'}
                </div>
            </div>

            {/* Section 1: Basic Information */}
            <div className="mb-6">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider bg-gray-200 px-2 py-1 border border-black border-b-0">
                    1. Basic Organization Profile
                </h3>
                <table className="w-full text-xs border border-black divide-y divide-black">
                    <tbody>
                        <tr className="divide-x divide-black">
                            <td className="w-1/4 p-2 bg-gray-50 font-bold uppercase">Organization Name:</td>
                            <td className="w-3/4 p-2 font-semibold">{toTitleCase(org.organizationName)}</td>
                        </tr>
                        <tr className="divide-x divide-black">
                            <td className="p-2 bg-gray-50 font-bold uppercase">Classification Type:</td>
                            <td className="p-2 font-semibold">{isNGO ? 'NGO / Non-Profit Entity' : 'Corporate (For-profit)'}</td>
                        </tr>
                        <tr className="divide-x divide-black">
                            <td className="p-2 bg-gray-50 font-bold uppercase">Official Email:</td>
                            <td className="p-2 font-mono">{org.organizationEmail}</td>
                        </tr>
                        <tr className="divide-x divide-black">
                            <td className="p-2 bg-gray-50 font-bold uppercase">Official Website:</td>
                            <td className="p-2 font-mono">{org.officialWebsite || 'N/A'}</td>
                        </tr>
                        <tr className="divide-x divide-black">
                            <td className="p-2 bg-gray-50 font-bold uppercase">Registered Location:</td>
                            <td className="p-2">{toTitleCase(org.city || '')}, {toTitleCase(org.state || '')}</td>
                        </tr>
                        <tr className="divide-x divide-black">
                            <td className="p-2 bg-gray-50 font-bold uppercase">Registration Date:</td>
                            <td className="p-2">{new Date(org.createdAt).toLocaleString()}</td>
                        </tr>
                        {org.organizationDescription && (
                            <tr className="divide-x divide-black">
                                <td className="p-2 bg-gray-50 font-bold uppercase">Description:</td>
                                <td className="p-2 text-justify leading-relaxed">{org.organizationDescription}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Section 2: Contact Person */}
            <div className="mb-6">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider bg-gray-200 px-2 py-1 border border-black border-b-0">
                    2. Primary Contact Person
                </h3>
                <table className="w-full text-xs border border-black divide-y divide-black">
                    <tbody>
                        <tr className="divide-x divide-black">
                            <td className="w-1/4 p-2 bg-gray-50 font-bold uppercase">Full Name:</td>
                            <td className="w-1/4 p-2 font-semibold">{toTitleCase(contactDetails.contactName || '')}</td>
                            <td className="w-1/4 p-2 bg-gray-50 font-bold uppercase">Designation:</td>
                            <td className="w-1/4 p-2 font-semibold">{toTitleCase(contactDetails.designation || '')}</td>
                        </tr>
                        <tr className="divide-x divide-black">
                            <td className="p-2 bg-gray-50 font-bold uppercase">Mobile Number:</td>
                            <td className="p-2 font-mono">{contactDetails.contactNumber || 'N/A'}</td>
                            <td className="p-2 bg-gray-50 font-bold uppercase">Contact Email:</td>
                            <td className="p-2 font-mono">{contactDetails.contactEmail || 'N/A'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Section 3: Entity Specific Details */}
            {isNGO ? (
                <div className="mb-6">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider bg-gray-200 px-2 py-1 border border-black border-b-0">
                        3. NGO Compliance, Governance & Financials
                    </h3>
                    <table className="w-full text-xs border border-black divide-y divide-black">
                        <tbody>
                            <tr className="divide-x divide-black">
                                <td className="w-1/4 p-2 bg-gray-50 font-bold uppercase">Founder / President:</td>
                                <td className="w-1/4 p-2 font-semibold">{ngoDetails.founderName || 'N/A'}</td>
                                <td className="w-1/4 p-2 bg-gray-50 font-bold uppercase">Founder Email:</td>
                                <td className="w-1/4 p-2 font-mono">{ngoDetails.founderEmail || 'N/A'}</td>
                            </tr>
                            <tr className="divide-x divide-black">
                                <td className="p-2 bg-gray-50 font-bold uppercase">Founder Mobile:</td>
                                <td className="p-2 font-mono">{ngoDetails.founderMobile || 'N/A'}</td>
                                <td className="p-2 bg-gray-50 font-bold uppercase">PAN Number:</td>
                                <td className="p-2 font-mono font-bold">{formatFieldValue('panCard', ngoDetails.panCard)}</td>
                            </tr>
                            <tr className="divide-x divide-black">
                                <td className="p-2 bg-gray-50 font-bold uppercase">80G Certification:</td>
                                <td className="p-2 font-bold uppercase">{ngoDetails.has80G || 'N/A'}</td>
                                <td className="p-2 bg-gray-50 font-bold uppercase">80G Expiry Date:</td>
                                <td className="p-2 font-mono">{ngoDetails.certification80GExpiryDate ? new Date(ngoDetails.certification80GExpiryDate).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                            <tr className="divide-x divide-black">
                                <td className="p-2 bg-gray-50 font-bold uppercase">FCRA Status:</td>
                                <td className="p-2 font-bold uppercase">{ngoDetails.hasFCRA || 'N/A'}</td>
                                <td className="p-2 bg-gray-50 font-bold uppercase">Annual Turnover:</td>
                                <td className="p-2 font-bold">{formatFieldValue('turnover', ngoDetails.annualTurnover || ngoDetails.annualBudget)}</td>
                            </tr>
                            <tr className="divide-x divide-black">
                                <td className="p-2 bg-gray-50 font-bold uppercase">Employee Strength:</td>
                                <td className="p-2">{ngoDetails.employeeStrength || 'N/A'}</td>
                                <td className="p-2 bg-gray-50 font-bold uppercase">Volunteer Strength:</td>
                                <td className="p-2">{ngoDetails.volunteerStrength || 'N/A'}</td>
                            </tr>
                            {ngoDetails.causesSupported?.length > 0 && (
                                <tr className="divide-x divide-black">
                                    <td className="p-2 bg-gray-50 font-bold uppercase">Causes Supported:</td>
                                    <td colSpan="3" className="p-2">{ngoDetails.causesSupported.map(c => toTitleCase(c)).join(', ')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="mb-6">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider bg-gray-200 px-2 py-1 border border-black border-b-0">
                        3. Corporate Governance & Business Details
                    </h3>
                    <table className="w-full text-xs border border-black divide-y divide-black">
                        <tbody>
                            <tr className="divide-x divide-black">
                                <td className="w-1/4 p-2 bg-gray-50 font-bold uppercase">Director Name:</td>
                                <td className="w-1/4 p-2 font-semibold">{companyDetails.directorName || 'N/A'}</td>
                                <td className="w-1/4 p-2 bg-gray-50 font-bold uppercase">Director Email:</td>
                                <td className="w-1/4 p-2 font-mono">{companyDetails.directorEmail || 'N/A'}</td>
                            </tr>
                            <tr className="divide-x divide-black">
                                <td className="p-2 bg-gray-50 font-bold uppercase">Director Mobile:</td>
                                <td className="p-2 font-mono">{companyDetails.directorMobile || 'N/A'}</td>
                                <td className="p-2 bg-gray-50 font-bold uppercase">Business Domain:</td>
                                <td className="p-2 font-semibold">{toTitleCase(companyDetails.businessDomain || '')}</td>
                            </tr>
                            <tr className="divide-x divide-black">
                                <td className="p-2 bg-gray-50 font-bold uppercase">Annual Turnover:</td>
                                <td className="p-2 font-bold">{formatFieldValue('turnover', companyDetails.annualTurnover || companyDetails.annualRevenue)}</td>
                                <td className="p-2 bg-gray-50 font-bold uppercase">Employees:</td>
                                <td className="p-2">{companyDetails.numberOfEmployees || 'N/A'}</td>
                            </tr>
                            <tr className="divide-x divide-black">
                                <td className="p-2 bg-gray-50 font-bold uppercase">Years Active:</td>
                                <td className="p-2">{companyDetails.yearsInOperation || 'N/A'}</td>
                                <td className="p-2 bg-gray-50 font-bold uppercase">Document Type:</td>
                                <td className="p-2 font-bold uppercase">{companyDetails.documentType || 'N/A'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Section 4: Clarification Logs */}
            {org.clarifications?.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider bg-gray-200 px-2 py-1 border border-black border-b-0">
                        4. Clarification History Log
                    </h3>
                    <table className="w-full text-xs border border-black divide-y divide-black">
                        <thead>
                            <tr className="bg-gray-100 divide-x divide-black text-left font-mono font-bold uppercase">
                                <th className="p-2 w-12 text-center">#</th>
                                <th className="p-2 w-1/3">Admin Request Note</th>
                                <th className="p-2 w-1/3">Organization Response</th>
                                <th className="p-2">Dates</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black">
                            {org.clarifications.map((item, idx) => (
                                <tr key={idx} className="divide-x divide-black">
                                    <td className="p-2 text-center font-bold">{idx + 1}</td>
                                    <td className="p-2 italic">{item.requestNotes}</td>
                                    <td className="p-2 font-semibold">{item.responseNotes || 'Awaiting response'}</td>
                                    <td className="p-2 font-mono text-[10px]">
                                        <div>Req: {new Date(item.requestedAt).toLocaleDateString()}</div>
                                        {item.respondedAt && <div>Res: {new Date(item.respondedAt).toLocaleDateString()}</div>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Section 5: Official Verification Sign-off */}
            <div className="border border-black p-4 mt-8 bg-gray-50">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider mb-2 border-b border-black pb-1">
                    Administrative Verification Sign-off & Audit Stamp
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <p><span className="font-bold uppercase">Verification Status:</span> {org.verificationStatus ? org.verificationStatus.toUpperCase() : 'PENDING'}</p>
                        <p className="mt-1"><span className="font-bold uppercase">Decision Date:</span> {org.verifiedAt ? new Date(org.verifiedAt).toLocaleString() : 'N/A'}</p>
                        <p className="mt-1 text-justify"><span className="font-bold uppercase">Admin Notes:</span> {org.verificationNotes || 'No additional verification notes recorded.'}</p>
                    </div>
                    <div className="border-l border-black pl-4 flex flex-col justify-between h-28">
                        <div>
                            <p className="font-bold uppercase text-[10px] text-gray-600">Authorized Signature & Seal</p>
                        </div>
                        <div className="border-t border-black pt-1 text-center font-mono text-[10px] uppercase font-bold text-gray-800">
                            TPF AID Verification Authority
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
