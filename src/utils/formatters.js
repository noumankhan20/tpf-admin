/**
 * Convert a string to Title Case (e.g., "mohammad mohsin alam" -> "Mohammad Mohsin Alam")
 * Also handles Edge cases like non-string inputs.
 */
export const toTitleCase = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Format specific fields intelligently based on their label/key.
 * Used automatically by the Field component.
 */
export const formatFieldValue = (label, value) => {
    if (!value || typeof value !== 'string') return value;

    const lowerLabel = String(label).toLowerCase();

    // Fields that should always be UPPERCASE
    if (
        lowerLabel.includes('pan') ||
        lowerLabel.includes('ifsc') ||
        lowerLabel.includes('id number') ||
        lowerLabel.includes('registration number') || 
        lowerLabel.includes('id type')
    ) {
        return value.toUpperCase();
    }

    // Fields that should be passed EXACTLY as they are (Emails, Links)
    if (
        lowerLabel.includes('email') ||
        lowerLabel.includes('website') ||
        lowerLabel.includes('url') || 
        lowerLabel.includes('link')
    ) {
        return value.toLowerCase(); // usually emails are best displayed in lowercase for absolute clarity
    }

    // Fields that should just be normal sentences (no forced casing except maybe first letter)
    if (
        lowerLabel.includes('about') ||
        lowerLabel.includes('description') ||
        lowerLabel.includes('reason') ||
        lowerLabel.includes('statement') ||
        lowerLabel.includes('causes')
    ) {
        return value; 
    }

    // Default formatting: Title Case (Names, States, Cities, Roles, Genders, etc.)
    return toTitleCase(value);
};
