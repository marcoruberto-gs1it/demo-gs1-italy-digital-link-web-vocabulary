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
  // Flag di visibilità condizionale
  hasBatch = false;
  hasBestBefore = false;

  product = {
    nameIT: 'Marmellata di fragole Extra',
    nameEN: 'Extra Strawberry Jam',
    gtin: '', 
    batch: '',
    bestBefore: '',
    imageUrl: 'https://demo.gs1it.org/gtin/08032089000147/front.png',
    price: '3.90',
    oldPrice: '4.50',
    currency: 'EUR',
    stockStatus: 'InStock',
    stockDisplay: 'Disponibile - Spedizione in 24h',
    gpcCategory: '10000217 (Marmellate/Confetture)',
    gpcCode: '10000217',
    netWeight: '250',
    targetMarkets: ['IT', 'SM'],
    ingredients: 'Fragole, Zucchero, Succo di limone concentrato, Gelificante: Pectina di frutta.',
    fruitContent: '55g per 100g di prodotto',
    sugarContent: '60g per 100g di prodotto',
    allergens: ['Assenti. Prodotto in uno stabilimento che utilizza frutta a guscio.'],
    storageInstructions: "Conservare in luogo fresco e asciutto. Dopo l'apertura conservare in frigorifero a +4°C e consumare entro 14 giorni.",
    packaging: [
      { type: 'Vaso', material: 'Vetro', code: 'GL 70', recycling: 'Vetro', icon: '🫙' },
      { type: 'Capsula', material: 'Acciaio', code: 'FE 40', recycling: 'Metalli', icon: '🥫' }
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

      // Assegnazione dati dinamici dall'URL
      this.product.gtin = scannedGtin || '08032089000147';
      this.product.batch = scannedBatch || '';
      this.product.bestBefore = scannedBestBefore || '';

      // Attivazione condizionale delle sezioni
      this.hasBatch = !!scannedBatch;
      this.hasBestBefore = !!scannedBestBefore;

      this.injectJsonLd();
    });
  }

  private injectJsonLd(): void {
    // 1. Costruiamo l'ID canonico dinamico in base ai dati presenti nell'URL
    let canonicalId = `https://id.gs1.org/01/${this.product.gtin}`;
    if (this.hasBatch) {
      canonicalId += `/10/${this.product.batch}`;
    }
    if (this.hasBestBefore) {
      canonicalId += `/17/${this.product.bestBefore}`;
    }

    // 2. Costruiamo il bizz-tree del JSON-LD base
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
      'gs1:ingredientStatement': `${this.product.ingredients} Frutta utilizzata: ${this.product.fruitContent}. Zuccheri totali: ${this.product.sugarContent}.`,
      'gs1:consumerStorageInstructions': this.product.storageInstructions,
      'gs1:allergenInfo': {
        '@type': 'gs1:AllergenDetails',
        'gs1:allergenStatement': this.product.allergens.join(', ')
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
          'gs1:packagingType': 'Lid',
          'gs1:packagingMaterialTypeCode': 'STEEL',
          'gs1:packagingRecyclingProcessType': 'Metal recycling'
        }
      ],
      'schema:offers': {
        '@type': 'schema:Offer',
        'schema:price': this.product.price,
        'schema:priceCurrency': this.product.currency,
        'schema:availability': `https://schema.org/${this.product.stockStatus}`,
        'schema:url': 'https://gs1it.org/shop/marmellata-fragole'
      },
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

    // 3. Arricchiamo il JSON-LD a seconda delle chiavi presenti nell'URL
    if (this.hasBatch) {
      jsonLd['gs1:batchLotNumber'] = this.product.batch;
    }
    if (this.hasBestBefore) {
      jsonLd['gs1:bestBeforeDate'] = this.product.bestBefore;
    }

    // Rimozione vecchi script per evitare duplicati al cambio rotta
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