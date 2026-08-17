/**
 * Convert a string to Title Case (e.g., "mohammad mohsin alam" -> "Mohammad Mohsin Alam")
 * Also handles Edge cases like non-string inputs.
 */
export const toTitleCase = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str
        .toLowerCase()
        .replace(/(?:^|\s|-)\S/g, (match) => match.toUpperCase());
};

/**
 * Format specific fields intelligently based on their label/key.
 * Used automatically by the Field component.
 */
export const formatFieldValue = (label, value) => {
    if (value === null || value === undefined) return value;
    const strVal = String(value).trim();
    if (!strVal) return value;

    const lowerLabel = String(label).toLowerCase();

    // Document numbers or registration codes that should always be UPPERCASE
    if (
        lowerLabel.includes('pan') ||
        lowerLabel.includes('gst') ||
        lowerLabel.includes('cin') ||
        lowerLabel.includes('ifsc') ||
        lowerLabel.includes('80g') ||
        lowerLabel.includes('fcra') ||
        lowerLabel.includes('id number') ||
        lowerLabel.includes('registration number') || 
        lowerLabel.includes('document number') ||
        lowerLabel.includes('id type') ||
        lowerLabel.includes('doc number') ||
        lowerLabel.includes('certificate number')
    ) {
        return strVal.toUpperCase();
    }

    // Fields that should be passed in lowercase (Emails, Web Links)
    if (
        lowerLabel.includes('email') ||
        lowerLabel.includes('website') ||
        lowerLabel.includes('url') || 
        lowerLabel.includes('link')
    ) {
        return strVal.toLowerCase();
    }

    // Paragraph text fields (Description, Notes, Statements, Reasons, Causes)
    if (
        lowerLabel.includes('about') ||
        lowerLabel.includes('description') ||
        lowerLabel.includes('reason') ||
        lowerLabel.includes('statement') ||
        lowerLabel.includes('causes') ||
        lowerLabel.includes('notes') ||
        lowerLabel.includes('comments')
    ) {
        return strVal; 
    }

    // Default formatting: Capitalize Every Word (Names, States, Cities, Roles, Statuses, Domains, etc.)
    return toTitleCase(strVal);
};
