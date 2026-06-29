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
    let canonicalId = `https://id.gs1.org/01/${this.product.gtin}`;
    if (this.hasBatch) canonicalId += `/10/${this.product.batch}`;
    if (this.hasBestBefore) canonicalId += `/17/${this.product.bestBefore}`;

    const jsonLd: any = {
      '@context': ['https://schema.org/', { gs1: 'https://gs1.org/voc/' }],
      '@id': canonicalId,
      '@type': ['Product', 'gs1:FoodAndBeverage'],
      'gs1:gtin': this.product.gtin,
      'gs1:productName': [
        { '@value': this.product.nameIT, '@language': 'it' },
        { '@value': this.product.nameEN, '@language': 'en' }
      ],
      'schema:image': this.product.imageUrl,
      'gs1:gpcCategoryCode': this.product.gpcCode,
      'gs1:netContent': {
        '@type': 'gs1:QuantitativeValue',
        'schema:value': this.product.netWeight,
        'schema:unitCode': 'GRM',
      },
      'gs1:ingredientStatement': this.product.ingredients,
      'gs1:consumerStorageInstructions': this.product.storageInstructions,
      
      'gs1:allergenInfo': {
        '@type': 'gs1:AllergenDetails',
        'gs1:allergenStatement': this.product.allergens.join(' ')
      },
      
      // Struttura a norma GS1 Web Vocabulary per i valori nutrizionali
      'gs1:nutrientBasisQuantity': {
        '@type': 'gs1:QuantitativeValue',
        'schema:value': '100',
        'schema:unitCode': 'GRM'
      },
      'gs1:energyPerNutrientBasis': [
        {
          '@type': 'gs1:NutritionMeasurementType',
          'schema:value': this.product.nutrition.energyKcal,
          'schema:unitCode': 'E14' // Kilocalorie
        },
        {
          '@type': 'gs1:NutritionMeasurementType',
          'schema:value': this.product.nutrition.energyKJ,
          'schema:unitCode': 'KJO' // Kilojoule
        }
      ],
      'gs1:fatPerNutrientBasis': {
        '@type': 'gs1:NutritionMeasurementType',
        'schema:value': this.product.nutrition.fat,
        'schema:unitCode': 'GRM'
      },
      'gs1:saturatedFatPerNutrientBasis': {
        '@type': 'gs1:NutritionMeasurementType',
        'schema:value': this.product.nutrition.saturatedFat,
        'schema:unitCode': 'GRM'
      },
      'gs1:carbohydratesPerNutrientBasis': {
        '@type': 'gs1:NutritionMeasurementType',
        'schema:value': this.product.nutrition.carbohydrates,
        'schema:unitCode': 'GRM'
      },
      'gs1:sugarsPerNutrientBasis': {
        '@type': 'gs1:NutritionMeasurementType',
        'schema:value': this.product.nutrition.sugars,
        'schema:unitCode': 'GRM'
      },
      'gs1:fibrePerNutrientBasis': {
        '@type': 'gs1:NutritionMeasurementType',
        'schema:value': this.product.nutrition.fiber,
        'schema:unitCode': 'GRM'
      },
      'gs1:proteinPerNutrientBasis': {
        '@type': 'gs1:NutritionMeasurementType',
        'schema:value': this.product.nutrition.protein,
        'schema:unitCode': 'GRM'
      },
      'gs1:saltPerNutrientBasis': {
        '@type': 'gs1:NutritionMeasurementType',
        'schema:value': this.product.nutrition.salt,
        'schema:unitCode': 'GRM'
      },

      'gs1:packaging': [
        {
          '@type': 'gs1:Packaging',
          'gs1:packagingType': 'Jar',
          'gs1:packagingMaterialTypeCode': 'GLASS',
          'gs1:packagingRecyclingProcessType': 'Glass recycling'
        },
        {
          '@type': 'gs1:Packaging',
          'gs1:packagingType': 'Cap',
          'gs1:packagingMaterialTypeCode': 'METAL',
          'gs1:packagingRecyclingProcessType': 'Metal recycling'
        }
      ],
      'gs1:brandOwner': {
        '@type': 'gs1:Organization',
        'gs1:organizationName': this.product.brandOwner.name,
        'schema:url': this.product.brandOwner.website,
        'gs1:address': {
          '@type': 'gs1:PostalAddress',
          'gs1:streetAddress': this.product.brandOwner.streetAddress,
          'gs1:postalCode': this.product.brandOwner.postalCode,
          'gs1:addressLocality': this.product.brandOwner.city,
          'gs1:addressRegion': this.product.brandOwner.province,
          'gs1:addressCountry': {
            '@type': 'gs1:Country',
            'gs1:countryCode': this.product.brandOwner.countryCode
          }
        }
      }
    };

    if (this.hasBatch) jsonLd['gs1:batchLotNumber'] = this.product.batch;
    if (this.hasBestBefore) jsonLd['gs1:bestBeforeDate'] = this.product.bestBeforeIso;

    const existingScript = this.document.head.querySelector('script[type="application/ld+json"]');
    if (existingScript) this.renderer.removeChild(this.document.head, existingScript);

    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    this.renderer.appendChild(this.document.head, script);
  }
}