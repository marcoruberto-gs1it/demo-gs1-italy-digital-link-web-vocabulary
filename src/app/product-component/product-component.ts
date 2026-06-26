import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './product-component.html',
  styles: [],
})
export class ProductComponent implements OnInit {
  product = {
    nameIT: 'Marmellata di fragole Extra',
    nameEN: 'Extra Strawberry Jam',
    gtin: '', // Lo lasceremo vuoto perché lo prenderemo dinamicamente dall'URL!
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
    batch: 'L-24082',
    bestBefore: '2026-10-30',
    ingredients:
      'Fragole, Zucchero, Succo di limone concentrato, Gelificante: Pectina di frutta.',
    fruitContent: '55g per 100g di prodotto',
    sugarContent: '60g per 100g di prodotto',
    allergens: [
      'Assenti. Prodotto in uno stabilimento che utilizza frutta a guscio.',
    ],
    storageInstructions:
      "Conservare in luogo fresco e asciutto. Dopo l'apertura conservare in frigorifero a +4°C e consumare entro 14 giorni.",
    packaging: [
      {
        type: 'Vaso',
        material: 'Vetro',
        code: 'GL 70',
        recycling: 'Raccolta Vetro',
        icon: '🫙',
      },
      {
        type: 'Capsula',
        material: 'Acciaio',
        code: 'FE 40',
        recycling: 'Raccolta Metalli',
        icon: '🥫',
      },
    ],
    brandOwner: {
      name: 'GS1 Italy',
      streetAddress: 'Via Pietro Paleocapa 7',
      postalCode: '20121',
      city: 'Milano',
      province: 'MI',
      countryCode: 'IT',
      website: 'http://gs1it.org',
    },
  };

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private route: ActivatedRoute // Iniettiamo lo strumento per leggere l'URL
  ) {}

  ngOnInit(): void {
    // Ci iscriviamo ai cambiamenti dell'URL
    this.route.paramMap.subscribe((params) => {
      // Estraiamo il valore di :gtin dal path '01/:gtin'
      const scannedGtin = params.get('gtin');

      if (scannedGtin) {
        this.product.gtin = scannedGtin;
      }

      // SOLO DOPO aver aggiornato il GTIN, generiamo il "gemello digitale"
      this.injectJsonLd();
    });
  }

  private injectJsonLd(): void {
    const jsonLd = {
      '@context': ['https://schema.org/', { gs1: 'https://gs1.org/voc/' }],
      '@id': `https://id.gs1.org/01/${this.product.gtin}/10/${this.product.batch}`,
      '@type': ['Product', 'gs1:FoodAndBeverage'],
      'gs1:gtin': this.product.gtin, // Adesso usa il GTIN reale scansionato dall'URL!
      'gs1:batchLotNumber': this.product.batch,
      'gs1:bestBeforeDate': this.product.bestBefore,
      'gs1:productName': [
        { '@value': this.product.nameIT, '@language': 'it' },
        { '@value': this.product.nameEN, '@language': 'en' },
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
        'gs1:allergenStatement': this.product.allergens.join(', '),
      },
      'gs1:packaging': [
        {
          '@type': 'gs1:Packaging',
          'gs1:packagingType': 'Jar',
          'gs1:packagingMaterialTypeCode': 'GLASS',
          'gs1:packagingRecyclingProcessType': 'Glass recycling',
        },
        {
          '@type': 'gs1:Packaging',
          'gs1:packagingType': 'Lid',
          'gs1:packagingMaterialTypeCode': 'STEEL',
          'gs1:packagingRecyclingProcessType': 'Metal recycling',
        },
      ],
      'schema:offers': {
        '@type': 'schema:Offer',
        'schema:price': this.product.price,
        'schema:priceCurrency': this.product.currency,
        'schema:availability': `https://schema.org/${this.product.stockStatus}`,
        'schema:url': 'https://gs1it.org/shop/marmellata-fragole',
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
            'gs1:countryCode': this.product.brandOwner.countryCode,
          },
        },
      },
    };

    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    this.renderer.appendChild(this.document.head, script);
  }
}
