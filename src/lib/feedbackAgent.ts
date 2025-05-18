export interface FeedbackAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral'
  keyConcern: string | null
  action: string
  upsellOpportunity: boolean
}

export function analyzeFeedback(feedback: string): FeedbackAnalysis {
  // Simple sentiment analysis based on keywords
  let sentiment: FeedbackAnalysis['sentiment'] = 'neutral'
  if (
    feedback.toLowerCase().includes('great job') ||
    feedback.toLowerCase().includes('excellent') ||
    feedback.toLowerCase().includes('happy')
  ) {
    sentiment = 'positive'
  } else if (
    feedback.toLowerCase().includes('slow') ||
    feedback.toLowerCase().includes('issue') ||
    feedback.toLowerCase().includes('problem')
  ) {
    sentiment = 'negative'
  }

  // Identify key concern (simplified)
  let keyConcern: FeedbackAnalysis['keyConcern'] = null
  if (feedback.toLowerCase().includes('delivery')) {
    keyConcern = 'delivery time'
  }

  // Determine action based on sentiment and concern
  let action: FeedbackAnalysis['action'] = 'leave'
  let upsellOpportunity: FeedbackAnalysis['upsellOpportunity'] = false

  if (sentiment === 'positive') {
    if (keyConcern) {
      action = 'follow-up with improvement note'
      upsellOpportunity = true // Assume positive sentiment with a minor concern is an upsell opportunity
    } else {
      action = 'upsell'
      upsellOpportunity = true
    }
  } else if (sentiment === 'negative') {
    action = 'follow-up to address concern'
    upsellOpportunity = false
  } else {
    action = 'follow-up for more feedback'
    upsellOpportunity = false
  }

  return {
    sentiment,
    keyConcern,
    action,
    upsellOpportunity,
  }
}
