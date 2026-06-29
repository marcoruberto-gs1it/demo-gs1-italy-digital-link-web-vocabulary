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

  // Dati reali estratti dalle fonti ufficiali GS1 del prodotto
  product = {
    nameIT: 'Confettura extra di fragole a ridotto contenuto di zuccheri',
    functionalName: 'Confettura light',
    shortDescription: 'Confettura Fragola Light',
    gtin: '8005360007746', 
    batch: '',
    bestBefore: '',
    bestBeforeFormatted: '',
    bestBeforeIso: '',
    imageUrl: 'https://assets.core.gs1it.org/images/7603330716851311642_md_fast.png', 
    price: '2.49',
    oldPrice: '2.99',
    currency: 'EUR',
    stockStatus: 'InStock',
    stockDisplay: 'Disponibile',
    gpcCategory: '10000217 - Marmellate/Confetture (Ambiente)',
    gpcCode: '10000217',
    targetMarkets: ['ITALIA (380)'],
    
    // --- DATI DI ETICHETTA E COMPOSIZIONE ---
    ingredients: 'Fragole, acqua, zucchero, gelificante: pectina da frutta.',
    fruitContent: '70g per 100g di prodotto finito',
    fruitPercentage: 70,
    sugarContent: '20g per 100g', 
    sugarPercentage: 20, 
    
    // Allergeni con evidenza delle contaminazioni crociate (MAY_CONTAIN)
    allergensStatement: 'Prodotto in uno stabilimento che utilizza sedano, latte, soia, frutta a guscio, pesce e molluschi.',
    allergensList: ['Sedano', 'Pesce', 'Latte', 'Molluschi', 'Soia', 'Frutta a guscio'],
    
    // --- MARKETING & SICUREZZA ---
    brandName: 'Le Conserve della Nonna',
    subBrand: 'Light',
    marketingText: 'Le nostre confetture Light nascono dalla frutta migliore e da ricette semplici, come fatte in casa. Zero edulcoranti e 50% di zuccheri in meno*, per esaltare il gusto autentico della frutta.',
    features: ['-50% di zuccheri*', 'Zero edulcoranti', '70% di Frutta', 'Fragola Italiana'],
    safetyWarning: 'CAPSULA DI SICUREZZA: RIFIUTARE SE IL BOTTONE È RIALZATO',
    storageInstructions: 'Dopo l\'apertura conservare in frigorifero e consumare entro 7 giorni.',
    storageType: 'Ambiente',
    
    // --- DATI LOGISTICI COMPLETI ---
    netWeight: '235',
    grossWeight: '388',
    dimensions: {
      height: '127',
      width: '58',
      depth: '58',
      unit: 'mm'
    },
    logisticsInfo: {
      isBaseUnit: true,
      isConsumerUnit: true,
      isOrderable: false,
      isInvoiceable: true
    },

    // --- VALORI NUTRIZIONALI REALI ---
    nutrition: {
      energyKJ: 383,
      energyKcal: 91,
      fat: 0,
      saturatedFat: 0,
      carbohydrates: 22,
      sugars: 20,
      fiber: 0,
      protein: 0,
      salt: 0
    },

    // --- PACKAGING E RICICLO (PPWR) ---
    packaging: [
      { type: 'Vaso/Barattolo', material: 'Vetro Chiaro', code: 'GL 70', recycling: 'Vetro', icon: '🫙' },
      { type: 'Tappo', material: 'Composito Plastica/Banda Stagnata', code: 'C/FE 91', recycling: 'Metallo', icon: '🥫' }
    ],
    
    // --- PRODUTTORE ---
    brandOwner: {
      name: 'Gruppo Fini S.p.A. a socio unico',
      streetAddress: 'Via Confine, 1583',
      postalCode: '41017',
      city: 'Ravarino',
      province: 'MO',
      countryCode: 'IT',
      telephone: '+39 059 900432',
      website: 'www.leconservedellanonna.it'
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

      if (scannedGtin) this.product.gtin = scannedGtin;
      this.product.batch = scannedBatch || '';
      this.product.bestBefore = scannedBestBefore || '';

      this.hasBatch = !!scannedBatch;
      this.hasBestBefore = !!scannedBestBefore;

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
      '@context': {
        'gs1': 'http://gs1.org/voc/',
        'xsd': 'http://www.w3.org/2001/XMLSchema#',
        '@vocab': 'http://gs1.org/voc/'
      },
      '@id': canonicalId,
      '@type': 'FoodBeverageTobaccoProduct', 
      'gtin': this.product.gtin,
      'productName': [{ '@value': this.product.nameIT, '@language': 'it' }],
      'functionalName': [{ '@value': this.product.functionalName, '@language': 'it' }],
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
        'value': { '@value': this.product.netWeight, '@type': 'xsd:float' },
        'unitCode': 'GRM'
      },
      'grossWeight': {
        '@type': 'QuantitativeValue',
        'value': { '@value': this.product.grossWeight, '@type': 'xsd:float' },
        'unitCode': 'GRM'
      },
      'inPackageHeight': {
        '@type': 'QuantitativeValue',
        'value': { '@value': this.product.dimensions.height, '@type': 'xsd:float' },
        'unitCode': 'MMT'
      },
      'inPackageWidth': {
        '@type': 'QuantitativeValue',
        'value': { '@value': this.product.dimensions.width, '@type': 'xsd:float' },
        'unitCode': 'MMT'
      },
      'inPackageDepth': {
        '@type': 'QuantitativeValue',
        'value': { '@value': this.product.dimensions.depth, '@type': 'xsd:float' },
        'unitCode': 'MMT'
      },
      'ingredientStatement': [{ '@value': this.product.ingredients, '@language': 'it' }],
      'consumerStorageInstructions': [{ '@value': this.product.storageInstructions, '@language': 'it' }],
      
      'nutrientBasisQuantity': {
        '@type': 'QuantitativeValue',
        'value': { '@value': '100', '@type': 'xsd:float' },
        'unitCode': 'GRM'
      },
      'energyPerNutrientBasis': [
        { '@type': 'NutritionMeasurementType', 'value': { '@value': this.product.nutrition.energyKcal.toString(), '@type': 'xsd:float' }, 'unitCode': 'E14' },
        { '@type': 'NutritionMeasurementType', 'value': { '@value': this.product.nutrition.energyKJ.toString(), '@type': 'xsd:float' }, 'unitCode': 'KJO' }
      ],
      'fatPerNutrientBasis': { '@type': 'NutritionMeasurementType', 'value': { '@value': this.product.nutrition.fat.toString(), '@type': 'xsd:float' }, 'unitCode': 'GRM' },
      'saturatedFatPerNutrientBasis': { '@type': 'NutritionMeasurementType', 'value': { '@value': this.product.nutrition.saturatedFat.toString(), '@type': 'xsd:float' }, 'unitCode': 'GRM' },
      'carbohydratesPerNutrientBasis': { '@type': 'NutritionMeasurementType', 'value': { '@value': this.product.nutrition.carbohydrates.toString(), '@type': 'xsd:float' }, 'unitCode': 'GRM' },
      'sugarsPerNutrientBasis': { '@type': 'NutritionMeasurementType', 'value': { '@value': this.product.nutrition.sugars.toString(), '@type': 'xsd:float' }, 'unitCode': 'GRM' },
      'proteinPerNutrientBasis': { '@type': 'NutritionMeasurementType', 'value': { '@value': this.product.nutrition.protein.toString(), '@type': 'xsd:float' }, 'unitCode': 'GRM' },
      'saltPerNutrientBasis': { '@type': 'NutritionMeasurementType', 'value': { '@value': this.product.nutrition.salt.toString(), '@type': 'xsd:float' }, 'unitCode': 'GRM' }
    };

    if (this.hasBatch) jsonLd['batchLotNumber'] = this.product.batch;
    if (this.hasBestBefore) jsonLd['bestBeforeDate'] = { '@value': this.product.bestBeforeIso, '@type': 'xsd:date' };

    const existingScript = this.document.head.querySelector('script[type="application/ld+json"]');
    if (existingScript) this.renderer.removeChild(this.document.head, existingScript);

    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    this.renderer.appendChild(this.document.head, script);
  }
}