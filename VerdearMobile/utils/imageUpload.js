import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

/**
 * Comprime uma imagem para um tamanho máximo
 * @param {string} uri - URI da imagem
 * @param {number} maxSizeMB - Tamanho máximo em MB (padrão: 2MB)
 * @returns {Promise<{uri: string, size: number}>}
 */
async function compressImage(uri, maxSizeMB = 2) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    // Tenta comprimir a imagem progressivamente
    let quality = 0.8;
    let compressedImage;

    do {
        compressedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }], // Redimensiona para largura máxima de 800px
            { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Estima o tamanho do arquivo (aproximado)
        const response = await fetch(compressedImage.uri);
        const blob = await response.blob();

        if (blob.size <= maxSizeBytes || quality <= 0.3) {
            return { uri: compressedImage.uri, size: blob.size };
        }

        quality -= 0.1;
    } while (quality > 0.3);

    return { uri: compressedImage.uri, size: compressedImage.size };
}

/**
 * Converte URI de imagem para Base64
 * @param {string} uri - URI da imagem
 * @returns {Promise<string>} String base64 da imagem
 */
async function uriToBase64(uri) {
    try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
        console.error('Erro ao converter para base64:', error);
        throw new Error('Falha ao converter imagem');
    }
}

/**
 * Converte imagem de perfil para Base64 (para salvar no Firestore)
 * @param {string} imageUri - URI da imagem local
 * @param {string} userId - ID do usuário (não usado, mantido para compatibilidade)
 * @param {number} maxSizeMB - Tamanho máximo permitido em MB
 * @returns {Promise<string>} String base64 da imagem
 */
export async function uploadProfileImage(imageUri, userId, maxSizeMB = 2) {
    try {
        // Validação inicial
        if (!imageUri) {
            throw new Error('URI da imagem é obrigatória');
        }

        console.log('Comprimindo imagem...');

        // Comprime a imagem se necessário
        const { uri: compressedUri, size } = await compressImage(imageUri, maxSizeMB);

        console.log(`Imagem comprimida: ${(size / 1024 / 1024).toFixed(2)}MB`);

        // Converte para base64
        console.log('Convertendo para base64...');
        const base64String = await uriToBase64(compressedUri);

        const base64Size = (base64String.length * 0.75) / 1024 / 1024; // Tamanho aproximado em MB
        console.log(`Base64 gerado: ${base64Size.toFixed(2)}MB`);

        // Firestore tem limite de 1MB por campo, avisa se estiver próximo
        if (base64Size > 0.9) {
            console.warn('Aviso: Imagem base64 próxima do limite do Firestore (1MB por campo)');
        }

        return base64String;
    } catch (error) {
        console.error('Erro ao processar imagem:', error);

        let errorMessage = 'Falha ao processar a imagem.';

        if (error.message.includes('base64')) {
            errorMessage = 'Erro ao converter imagem. Tente com uma foto menor.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
}

/**
 * Valida se uma URI de imagem é válida
 * @param {string} uri - URI da imagem
 * @returns {Promise<boolean>}
 */
export async function validateImageUri(uri) {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();

        // Verifica se é uma imagem
        if (!blob.type.startsWith('image/')) {
            throw new Error('O arquivo não é uma imagem válida');
        }

        return true;
    } catch (error) {
        console.error('Erro ao validar imagem:', error);
        return false;
    }
}
