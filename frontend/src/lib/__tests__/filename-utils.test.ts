/**
 * Tests pour les utilitaires de génération de noms de fichiers
 */

import { describe, it, expect } from 'vitest'
import { slugifyFilename, generateCleanFilename, generateSimulationFilename } from '../filename-utils'

describe('filename-utils', () => {
    describe('slugifyFilename', () => {
        it('convertit les accents français en ASCII', () => {
            expect(slugifyFilename('établissement hôtelier')).toBe('etablissement_hotelier')
            expect(slugifyFilename('café français')).toBe('cafe_francais')
            expect(slugifyFilename('résumé des activités')).toBe('resume_des_activites')
            expect(slugifyFilename('hôtel à Noël')).toBe('hotel_a_noel')
        })

        it('gère les caractères spéciaux français', () => {
            expect(slugifyFilename('garçon')).toBe('garcon')
            expect(slugifyFilename('cœur')).toBe('coeur')
            expect(slugifyFilename('æther')).toBe('aether')
        })

        it('nettoie les espaces multiples et caractères spéciaux', () => {
            expect(slugifyFilename('  multiple   espaces  ')).toBe('multiple_espaces')
            expect(slugifyFilename('test@#$%^&*()')).toBe('test')
            expect(slugifyFilename('test-avec-tirets')).toBe('test-avec-tirets')
        })

        it('gère les cas limites', () => {
            expect(slugifyFilename('')).toBe('')
            expect(slugifyFilename('   ')).toBe('')
            expect(slugifyFilename('123')).toBe('123')
            expect(slugifyFilename('MAJUSCULES')).toBe('majuscules')
        })
    })

    describe('generateCleanFilename', () => {
        it('génère des noms de fichiers propres', () => {
            expect(generateCleanFilename('rapport établissement', 'pdf'))
                .toBe('rapport_etablissement.pdf')
            
            expect(generateCleanFilename('café français', 'docx'))
                .toBe('cafe_francais.docx')
        })

        it('supprime les suffixes redondants', () => {
            expect(generateCleanFilename('rapport_docx', 'pdf'))
                .toBe('rapport.pdf')
            
            expect(generateCleanFilename('fichier_pdf_docx', 'txt'))
                .toBe('fichier.txt')
        })

        it('utilise pdf par défaut', () => {
            expect(generateCleanFilename('test'))
                .toBe('test.pdf')
        })
    })

    describe('generateSimulationFilename', () => {
        it('génère des noms de fichiers de simulation', () => {
            const date = new Date('2025-01-07')
            const filename = generateSimulationFilename('COMETE', 25000, 8, date)
            
            expect(filename).toBe('simulation_scpi_comete_25000e_8ans_2025-01-07.pdf')
        })

        it('arrondit les montants', () => {
            const date = new Date('2025-01-07')
            const filename = generateSimulationFilename('ACTIVIMMO', 25499.99, 10, date)
            
            expect(filename).toBe('simulation_scpi_activimmo_25500e_10ans_2025-01-07.pdf')
        })
    })

    describe('Exemples du problème original', () => {
        it('corrige le problème initial mentionné', () => {
            // Problème original: "g1702_bagagiste_en__tablissement_h_telier_de_metier_docx.docx"
            const input = "bagagiste en établissement hôtelier de métier"
            
            expect(slugifyFilename(input))
                .toBe('bagagiste_en_etablissement_hotelier_de_metier')
            
            expect(generateCleanFilename(input, 'docx'))
                .toBe('bagagiste_en_etablissement_hotelier_de_metier.docx')
        })

        it('préserve la lisibilité vs suppression complète des accents', () => {
            const input = "café à côté de l'hôtel"
            
            // Notre solution (lisible)
            expect(slugifyFilename(input))
                .toBe('cafe_a_cote_de_l_hotel')
            
            // VS suppression brutale des accents (illisible)
            // "cf  ct de l'htel" ❌
        })
    })
})






