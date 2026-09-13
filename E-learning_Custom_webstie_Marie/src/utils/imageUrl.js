import url from '@/redux/api/baseUrl';

export const DEFAULT_AVATAR =
    'https://t4.ftcdn.net/jpg/04/34/72/82/360_F_434728286_OWQQvAFoXZLdGHlGqYqXqQH8aGC2bG.jpg';

export const getFullImageUrl = (imagePath, fallback = DEFAULT_AVATAR) => {
    if (!imagePath) return fallback;
    if (typeof imagePath !== 'string') return fallback;
    if (
        imagePath.startsWith('http://') ||
        imagePath.startsWith('https://') ||
        imagePath.startsWith('blob:') ||
        imagePath.startsWith('data:')
    ) {
        return imagePath;
    }
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${url}${cleanPath}`;
};

export default getFullImageUrl;
