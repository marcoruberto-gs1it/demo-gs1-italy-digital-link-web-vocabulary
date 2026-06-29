import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './product-component.html'
})
export class ProductComponent implements OnInit {
  hasBatch = false;
  hasBestBefore = false;

  // Modello dati consolidato e fittizio per la demo GS1 Italy
  product = {
    nameIT: 'Marmellata di fragole',
    nameEN: 'Strawberry jam',
    gtin: '', 
    batch: '',
    bestBefore: '',
    bestBeforeFormatted: '', // Data per gli umani (DD/MM/YYYY)
    bestBeforeIso: '',       // Data standard ISO per il JSON-LD (YYYY-MM-DD)
    imageUrl: 'https://demo.gs1it.org/gtin/08032089000147/front.png', 
    price: '2.89',
    oldPrice: '3.50',
    currency: 'EUR',
    stockStatus: 'InStock',
    stockDisplay: 'Disponibile',
    gpcCategory: '10000217 Marmellate/Confetture (Ambiente)',
    gpcCode: '10000217',
    netWeight: '250',
    targetMarkets: ['IT', 'SM'], // Italy, San Marino
    
    ingredients: 'Fragole, Zucchero, Gelificante: pectina di frutta, Succo di limone concentrato.',
    fruitContent: '50g per 100g',
    fruitPercentage: 50,
    sugarContent: '42g per 100g', 
    sugarPercentage: 42,
    allergens: ['Senza glutine.', 'Prodotto vegano.'],
    storageInstructions: "Conservare in luogo asciutto e lontano da fonti di calore. Dopo l'apertura conservare in frigorifero e consumare entro 14 giorni.",
    
    nutrition: {
      energyKJ: 805,
      energyKcal: 190,
      fat: 0,
      saturatedFat: 0,
      carbohydrates: 46,
      sugars: 42,
      fiber: 1.3,
      protein: 0.4,
      salt: 0.06
    },

    packaging: [
      { type: 'Vaso', material: 'Vetro', code: 'GL 70', recycling: 'Vetro', icon: '🫙' },
      { type: 'Tappo', material: 'Metallo', code: 'FE 40', recycling: 'Metallo', icon: '🥫' }
    ],
    
    brandOwner: {
      name: 'GS1 Italy',
      streetAddress: 'Via Pietro Paleocapa 7',
      postalCode: '20121',
      city: 'Milano',
      province: 'MI',
      countryCode: 'IT',
      website: 'http://gs1it.org'
    }
  };

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private route: ActivatedRoute 
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const scannedGtin = params.get('gtin');
      const scannedBatch = params.get('batch');
      const scannedBestBefore = params.get('bestBefore');

      this.product.gtin = scannedGtin || '08032089000147';
      this.product.batch = scannedBatch || '';
      this.product.bestBefore = scannedBestBefore || '';

      this.hasBatch = !!scannedBatch;
      this.hasBestBefore = !!scannedBestBefore;

      // Algoritmo di decodifica Data GS1 (Formato YYMMDD)
      if (this.hasBestBefore && this.product.bestBefore.length === 6) {
        const yy = this.product.bestBefore.substring(0, 2);
        const mm = this.product.bestBefore.substring(2, 4);
        const dd = this.product.bestBefore.substring(4, 6);
        
        this.product.bestBeforeFormatted = `${dd}/${mm}/20${yy}`;
        this.product.bestBeforeIso = `20${yy}-${mm}-${dd}`;
      } else {
        this.product.bestBeforeFormatted = this.product.bestBefore;
        this.product.bestBeforeIso = this.product.bestBefore;
      }

      this.injectJsonLd();
    });
  }

  private injectJsonLd(): void {
    // 1. Costruiamo il Digital Link (URI) Canonico
    let canonicalId = `https://id.gs1.org/01/${this.product.gtin}`;
    if (this.hasBatch) canonicalId += `/10/${this.product.batch}`;
    if (this.hasBestBefore) canonicalId += `/17/${this.product.bestBefore}`;

    // 2. Creiamo il JSON-LD in formato "Puro GS1 Web Vocabulary"
    const jsonLd: any = {
      '@context': {
        'gs1': 'http://gs1.org/voc/',
        'xsd': 'http://www.w3.org/2001/XMLSchema#',
        '@vocab': 'http://gs1.org/voc/' // Rende GS1 il dizionario predefinito per tutte le chiavi
      },
      '@id': canonicalId,
      // Usiamo il tipo specifico per il Largo Consumo alimentare
      '@type': 'FoodBeverageTobaccoProduct', 
      
      'gtin': this.product.gtin,
      'productName': [
        { '@value': this.product.nameIT, '@language': 'it' },
        { '@value': this.product.nameEN, '@language': 'en' }
      ],
      'image': {
        '@type': 'ReferencedFileDetails',
        'referencedFileURL': { '@id': this.product.imageUrl }
      },
      'brandOwner': {
        '@type': 'Organization',
        'organizationName': this.product.brandOwner.name
      },
      'netWeight': {
        '@type': 'QuantitativeValue',
        'value': {
          '@value': this.product.netWeight.toString(),
          '@type': 'xsd:float'
        },
        'unitCode': 'GRM'
      },
      'ingredientStatement': [
        { '@value': this.product.ingredients, '@language': 'it' }
      ],
      'consumerStorageInstructions': [
        { '@value': this.product.storageInstructions, '@language': 'it' }
      ],
      
      // === VALORI NUTRIZIONALI (Formato formale GS1) ===
      'nutrientBasisQuantity': {
        '@type': 'QuantitativeValue',
        'value': { 
          '@value': '100', 
          '@type': 'xsd:float' 
        },
        'unitCode': 'GRM'
      },
      'energyPerNutrientBasis': [
        {
          '@type': 'NutritionMeasurementType',
          'value': { '@value': this.product.nutrition.energyKcal.toString(), '@type': 'xsd:float' },
          'unitCode': 'E14' // UN/CEFACT per le Kilocalorie
        },
        {
          '@type': 'NutritionMeasurementType',
          'value': { '@value': this.product.nutrition.energyKJ.toString(), '@type': 'xsd:float' },
          'unitCode': 'KJO' // UN/CEFACT per i Kilojoule
        }
      ],
      'fatPerNutrientBasis': {
        '@type': 'NutritionMeasurementType',
        'value': { '@value': this.product.nutrition.fat.toString(), '@type': 'xsd:float' },
        'unitCode': 'GRM'
      },
      'saturatedFatPerNutrientBasis': {
        '@type': 'NutritionMeasurementType',
        'value': { '@value': this.product.nutrition.saturatedFat.toString(), '@type': 'xsd:float' },
        'unitCode': 'GRM'
      },
      'carbohydratesPerNutrientBasis': {
        '@type': 'NutritionMeasurementType',
        'value': { '@value': this.product.nutrition.carbohydrates.toString(), '@type': 'xsd:float' },
        'unitCode': 'GRM'
      },
      'sugarsPerNutrientBasis': {
        '@type': 'NutritionMeasurementType',
        'value': { '@value': this.product.nutrition.sugars.toString(), '@type': 'xsd:float' },
        'unitCode': 'GRM'
      },
      'fibrePerNutrientBasis': {
        '@type': 'NutritionMeasurementType',
        'value': { '@value': this.product.nutrition.fiber.toString(), '@type': 'xsd:float' },
        'unitCode': 'GRM'
      },
      'proteinPerNutrientBasis': {
        '@type': 'NutritionMeasurementType',
        'value': { '@value': this.product.nutrition.protein.toString(), '@type': 'xsd:float' },
        'unitCode': 'GRM'
      },
      'saltPerNutrientBasis': {
        '@type': 'NutritionMeasurementType',
        'value': { '@value': this.product.nutrition.salt.toString(), '@type': 'xsd:float' },
        'unitCode': 'GRM'
      },

      // === ECO-RICICLO / PPWR ===
      'packaging': [
        {
          '@type': 'Packaging',
          'packagingType': 'Jar',
          'packagingMaterialTypeCode': 'GLASS',
          'packagingRecyclingProcessType': 'Glass recycling'
        },
        {
          '@type': 'Packaging',
          'packagingType': 'Cap',
          'packagingMaterialTypeCode': 'METAL',
          'packagingRecyclingProcessType': 'Metal recycling'
        }
      ]
    };

    // 3. Aggiunta dati dinamici del Digital Link (Lotto e Scadenza)
    if (this.hasBatch) {
      jsonLd['batchLotNumber'] = this.product.batch;
    }
    
    if (this.hasBestBefore) {
      // Dichiariamo formale che la data è di tipo ISO (xsd:date) e non una stringa a caso
      jsonLd['bestBeforeDate'] = {
        '@value': this.product.bestBeforeIso,
        '@type': 'xsd:date'
      };
    }

    // 4. Iniezione sicura nel DOM
    const existingScript = this.document.head.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      this.renderer.removeChild(this.document.head, existingScript);
    }

    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    this.renderer.appendChild(this.document.head, script);
  }
}