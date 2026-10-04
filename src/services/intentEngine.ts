import { IntentType, IntentDecision, LeadDiscovery, TranscriptTurn } from '../types';

export function evaluateLeadIntent(
  transcript: TranscriptTurn[],
  currentDiscovery: Partial<LeadDiscovery> = {}
): {
  decision: IntentDecision;
  updatedDiscovery: LeadDiscovery;
  midCallTriggerRequired: boolean;
  callbackRequested: boolean;
  callbackUtterance?: string;
} {
  let score = 20; // baseline neutral
  const signals: string[] = [];
  const reasons: string[] = [];
  const hardOverrides: string[] = [];
  let callbackRequested = false;
  let callbackUtterance: string | undefined;

  const fullCustomerText = transcript
    .filter(t => t.speaker === 'customer')
    .map(t => t.text)
    .join(' ');

  const textLower = fullCustomerText.toLowerCase();

  // Updated discovery accumulator
  const discovery: LeadDiscovery = {
    businessType: currentDiscovery.businessType,
    catalogSize: currentDiscovery.catalogSize,
    budgetRange: currentDiscovery.budgetRange,
    timeline: currentDiscovery.timeline,
    keyFeatures: [...(currentDiscovery.keyFeatures || [])],
    decisionMaker: currentDiscovery.decisionMaker ?? true,
    decisionMakerRole: currentDiscovery.decisionMakerRole,
    primaryLanguage: currentDiscovery.primaryLanguage || 'English',
    barriers: [...(currentDiscovery.barriers || [])]
  };

  // 1. Language Detection (English, Telugu, Hindi, Code-switch)
  const teluguMarkers = ['avunu', 'ledu', 'kavali', 'entha', 'repu', 'cheyandi', 'gantalaki', 'matladali', 'chustunna', 'unnayi', 'memu', 'manchi', 'vastundi', 'bale'];
  const hindiMarkers = ['haan', 'nahi', 'chahiye', 'kitna', 'kal', 'karo', 'baje', 'baat', 'dekh', 'bhaiya', 'dukan', 'lagta', 'shuru'];

  const hasTelugu = teluguMarkers.some(m => textLower.includes(m));
  const hasHindi = hindiMarkers.some(m => textLower.includes(m));
  const hasEnglish = textLower.includes('website') || textLower.includes('ecommerce') || textLower.includes('store') || textLower.includes('products') || textLower.includes('online');

  if (hasTelugu && hasEnglish) discovery.primaryLanguage = 'Mixed';
  else if (hasTelugu) discovery.primaryLanguage = 'Telugu';
  else if (hasHindi && hasEnglish) discovery.primaryLanguage = 'Mixed';
  else if (hasHindi) discovery.primaryLanguage = 'Hindi';
  else discovery.primaryLanguage = 'English';

  // 2. Business Type extraction
  if (textLower.includes('saree') || textLower.includes('boutique') || textLower.includes('clothing') || textLower.includes('dress') || textLower.includes('textile') || textLower.includes('ethnic')) {
    discovery.businessType = 'Ethnic Wear / Boutique';
    signals.push('Business sector identified: Ethnic Fashion / Boutique');
    score += 15;
  } else if (textLower.includes('spice') || textLower.includes('food') || textLower.includes('grocery') || textLower.includes('organic')) {
    discovery.businessType = 'Organic Spices & Food';
    signals.push('Business sector identified: Spices & Organic Food');
    score += 15;
  } else if (textLower.includes('electronic') || textLower.includes('gadget') || textLower.includes('mobile')) {
    discovery.businessType = 'Consumer Electronics';
    signals.push('Business sector identified: Electronics');
    score += 15;
  } else if (textLower.includes('shoes') || textLower.includes('footwear') || textLower.includes('leather')) {
    discovery.businessType = 'Footwear & Accessories';
    signals.push('Business sector identified: Footwear');
    score += 15;
  }

  // 3. Catalog / Product Count
  const countMatch = textLower.match(/(\d+)\s*(products|items|sku|varieties|sarees|pieces|designs)/i);
  if (countMatch) {
    discovery.catalogSize = parseInt(countMatch[1], 10);
    signals.push(`Specific catalog volume stated: ~${discovery.catalogSize} products`);
    score += 15;
  } else if (textLower.includes('around 100') || textLower.includes('150') || textLower.includes('hundreds')) {
    discovery.catalogSize = '100-200 products';
    score += 12;
  }

  // 4. Timeline
  if (textLower.includes('10 days') || textLower.includes('next week') || textLower.includes('two weeks') || textLower.includes('immediately') || textLower.includes('soon') || textLower.includes('fast') || textLower.includes('jaldi') || textLower.includes('tvaraga')) {
    discovery.timeline = 'Immediate (1-2 weeks)';
    signals.push('Urgent deployment timeline requested');
    reasons.push('Prospect is on an aggressive timeline');
    score += 20;
  } else if (textLower.includes('next month') || textLower.includes('after diwali') || textLower.includes('festive season')) {
    discovery.timeline = 'Flexible (1-2 months)';
    signals.push('Deferred timeline (1-2 months)');
    score += 5;
  }

  // 5. Budget Signals & Pricing queries
  const asksPrice = textLower.includes('price') || textLower.includes('cost') || textLower.includes('entha') || textLower.includes('charges') || textLower.includes('package') || textLower.includes('kitna kharcha') || textLower.includes('rate');
  if (asksPrice) {
    signals.push('Active pricing inquiry ("How much will it cost / package details")');
    reasons.push('Prospect explicitly inquired about commercial terms and package costs');
    score += 25;
  }

  const budgetMatch = textLower.match(/(?:budget|around|upto|under)\s*(?:is|of)?\s*(?:rs\.?|inr|₹)?\s*(\d{2,3})k?/i);
  if (budgetMatch) {
    const rawNum = budgetMatch[1];
    discovery.budgetRange = rawNum.endsWith('k') ? `₹${rawNum}` : `₹${rawNum},000`;
    signals.push(`Explicit budget mentioned: ${discovery.budgetRange}`);
    score += 15;
  }

  // 6. Feature Requirements
  const features = new Set(discovery.keyFeatures || []);
  if (textLower.includes('payment') || textLower.includes('razorpay') || textLower.includes('upi') || textLower.includes('phonepe') || textLower.includes('gateway')) {
    features.add('UPI & Razorpay Payment Gateway');
    signals.push('Feature: Payment Gateway');
  }
  if (textLower.includes('whatsapp') || textLower.includes('order on whatsapp') || textLower.includes('notifications')) {
    features.add('WhatsApp Order Notifications');
    signals.push('Feature: WhatsApp Ordering');
  }
  if (textLower.includes('telugu') || textLower.includes('regional') || textLower.includes('vernacular')) {
    features.add('Telugu / Multilingual UI');
    signals.push('Feature: Telugu Vernacular Support');
  }
  if (textLower.includes('inventory') || textLower.includes('stock') || textLower.includes('shipping')) {
    features.add('Automated Inventory & Shipping Tracking');
  }
  discovery.keyFeatures = Array.from(features);

  // 7. Barriers & Decision Maker checks (WARM signals)
  const isSomeoneElse = textLower.includes('brother') || textLower.includes('partner') || textLower.includes('father') || textLower.includes('manager') || textLower.includes('bhaiya') || textLower.includes('matladali');
  if (isSomeoneElse) {
    discovery.decisionMaker = false;
    discovery.decisionMakerRole = 'Consults business partner/family';
    discovery.barriers?.push('Decision requires co-founder / partner alignment');
    signals.push('Stakeholder barrier: Partner / family member decides');
    reasons.push('Prospect is interested but needs to consult other stakeholders');
    score = Math.min(score, 65); // Cap to WARM range
  }

  // 8. Callback Request checks (WARM signals)
  const callbackTriggers = ['call me back', 'call tomorrow', 'repu', 'kal call', 'later', 'busy right now', 'call cheyandi', 'matladadam', 'after 2 hours', 'bataunga'];
  for (const t of transcript.filter(turn => turn.speaker === 'customer')) {
    const tLower = t.text.toLowerCase();
    if (callbackTriggers.some(trigger => tLower.includes(trigger))) {
      callbackRequested = true;
      callbackUtterance = t.text;
      signals.push(`Callback requested: "${t.text}"`);
      reasons.push(`Prospect requested follow-up call: ${t.text}`);
      break;
    }
  }

  // 9. COLD Signals & Hard Negative Overrides
  const isColdExplicit = textLower.includes('not interested') || textLower.includes('don\'t call') || textLower.includes('vadhu') || textLower.includes('nahin chahiye') || textLower.includes('college project') || textLower.includes('just looking') || textLower.includes('no budget');
  if (isColdExplicit) {
    hardOverrides.push('Explicit non-buyer or disinterest indicator detected');
    score = 15;
  }

  // Clamp score
  score = Math.max(5, Math.min(98, score));

  // Determine classification
  let intent: IntentType = 'COLD';
  let recommendedAction: IntentDecision['recommendedAction'] = 'LOG_AND_NURTURE';

  if (score >= 68 && hardOverrides.length === 0) {
    intent = 'HOT';
    recommendedAction = 'FIRE_MID_CALL_WHATSAPP';
    reasons.push('High intent detected: ready requirements, commercial inquiry, active purchase signals');
  } else if (score >= 32 || callbackRequested || isSomeoneElse) {
    intent = 'WARM';
    recommendedAction = 'SCHEDULE_CALLBACK';
    reasons.push('Moderate intent: has genuine business need but deferred timeline or requires callback');
  } else {
    intent = 'COLD';
    recommendedAction = 'LOG_AND_NURTURE';
    reasons.push('Low intent: casual inquiry, exploratory student, or unbudgeted lead');
  }

  // Mid-call action trigger criteria:
  // Fired when classified as HOT or when prospect asks "send me details / catalog / pricing on WhatsApp" while on the call!
  const askedWhatsAppDirectly = textLower.includes('send me details') || textLower.includes('whatsapp lo pampandi') || textLower.includes('whatsapp kar do') || textLower.includes('details send karo');
  const midCallTriggerRequired = (intent === 'HOT' || askedWhatsAppDirectly) && !isColdExplicit;

  return {
    decision: {
      score,
      intent,
      confidence: intent === 'HOT' ? 0.92 : intent === 'WARM' ? 0.88 : 0.82,
      reasons,
      signals,
      hardOverrides,
      recommendedAction,
      actionTriggered: midCallTriggerRequired || callbackRequested
    },
    updatedDiscovery: discovery,
    midCallTriggerRequired,
    callbackRequested,
    callbackUtterance
  };
}
