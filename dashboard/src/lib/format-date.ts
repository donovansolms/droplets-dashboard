export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
    };

    return date.toLocaleDateString('en-GB', options);
}

export const formatDateLong = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    };

    return date.toLocaleDateString('en-GB', options);
}

export const formatDateWithTime = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
    };

    return date.toLocaleDateString('en-GB', options) + ' UTC';
}