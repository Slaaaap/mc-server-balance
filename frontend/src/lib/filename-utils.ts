/**
 * Utilitaires pour la génération de noms de fichiers
 * Convertit les accents français en équivalents ASCII
 */

/**
 * Convertit une chaîne avec accents en version ASCII lisible
 * 
 * @param text - Texte avec accents français
 * @returns Texte avec accents convertis en ASCII (é → e, ç → c, etc.)
 * 
 * @example
 * slugifyFilename("bagagiste en établissement hôtelier de métier")
 * // → "bagagiste_en_etablissement_hotelier_de_metier"
 */
export function slugifyFilename(text: string): string {
    // Mapping des accents français vers ASCII
    const accentMap: Record<string, string> = {
        // Voyelles avec accents
        'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
        'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
        'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
        'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
        'ý': 'y', 'ÿ': 'y',
        
        // Majuscules
        'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A',
        'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
        'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
        'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O',
        'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
        'Ý': 'Y', 'Ÿ': 'Y',
        
        // Cédille
        'ç': 'c', 'Ç': 'C',
        
        // Autres caractères spéciaux français
        'æ': 'ae', 'Æ': 'AE',
        'œ': 'oe', 'Œ': 'OE',
        'ñ': 'n', 'Ñ': 'N'
    }
    
    return text
        // Convertir les accents
        .split('')
        .map(char => accentMap[char] || char)
        .join('')
        // Nettoyer les caractères spéciaux (garder lettres, chiffres, espaces, tirets)
        .replace(/[^\w\s\-]/g, '')
        // Espaces multiples → un seul espace
        .replace(/\s+/g, ' ')
        // Espaces → underscores
        .replace(/\s/g, '_')
        // Underscores multiples → un seul
        .replace(/_{2,}/g, '_')
        // Supprimer underscores en début/fin
        .replace(/^_+|_+$/g, '')
        // Minuscules
        .toLowerCase()
}

/**
 * Génère un nom de fichier propre sans suffixe redondant
 * 
 * @param baseName - Nom de base du fichier
 * @param extension - Extension souhaitée (sans le point)
 * @returns Nom de fichier nettoyé
 * 
 * @example
 * generateCleanFilename("bagagiste en établissement hôtelier", "docx")
 * // → "bagagiste_en_etablissement_hotelier.docx"
 * 
 * generateCleanFilename("rapport_financier_docx", "pdf") 
 * // → "rapport_financier.pdf" (enlève le suffixe redondant)
 */
export function generateCleanFilename(baseName: string, extension: string = 'pdf'): string {
    const cleanBaseName = slugifyFilename(baseName)
        // Supprimer les suffixes redondants comme "_docx", "_pdf", etc.
        .replace(new RegExp(`_?(${extension}|docx|pdf|xlsx|txt)_?$`, 'gi'), '')
    
    return `${cleanBaseName}.${extension.toLowerCase()}`
}

/**
 * Génère un nom de fichier pour les résultats de simulation SCPI
 * 
 * @param scpiType - Type de SCPI (Comète, ActivImmo)
 * @param investmentAmount - Montant investi
 * @param duration - Durée en années
 * @param date - Date optionnelle (défaut: maintenant)
 * @returns Nom de fichier descriptif
 * 
 * @example
 * generateSimulationFilename("COMETE", 25000, 8)
 * // → "simulation_scpi_comete_25000e_8ans_2025-01-07.pdf"
 */
export function generateSimulationFilename(
    scpiType: string,
    investmentAmount: number,
    duration: number,
    date: Date = new Date()
): string {
    const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
    const amountStr = `${Math.round(investmentAmount)}e`
    const durationStr = `${duration}ans`
    
    const baseName = `simulation_scpi_${scpiType}_${amountStr}_${durationStr}_${dateStr}`
    
    return generateCleanFilename(baseName, 'pdf')
}

/**
 * Tests et exemples d'usage
 */
if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    // Tests en développement seulement
    console.group('🧪 Tests filename-utils')
    
    console.log('slugifyFilename exemples:')
    console.log('  "établissement hôtelier" →', slugifyFilename("établissement hôtelier"))
    console.log('  "café français à Noël" →', slugifyFilename("café français à Noël"))
    console.log('  "résumé des activités" →', slugifyFilename("résumé des activités"))
    
    console.log('\ngenerateCleanFilename exemples:')
    console.log('  "rapport_docx", "pdf" →', generateCleanFilename("rapport_docx", "pdf"))
    console.log('  "établissement hôtelier de métier" →', generateCleanFilename("établissement hôtelier de métier", "docx"))
    
    console.log('\ngenerateSimulationFilename exemple:')
    console.log('  COMETE, 25000, 8 →', generateSimulationFilename("COMETE", 25000, 8))
    
    console.groupEnd()
}






