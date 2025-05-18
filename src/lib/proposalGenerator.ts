export interface ProposalOptions {
  clientNeeds: string
}

export function generateProposal(options: ProposalOptions): string {
  const { clientNeeds } = options

  const proposalContent = `
# Project Proposal

## Project Overview

Based on your requirement to "${clientNeeds}", we propose developing a comprehensive cross-platform mobile application for e-commerce, complemented by a robust admin dashboard.

## Deliverables

- **Cross-Platform Mobile Application:** A native-like experience on both iOS and Android platforms.
- **Admin Dashboard:** A web-based interface for managing products, orders, users, and content.
- **User Authentication:** Secure login and signup functionalities.
- **Shopping Cart:** Features for adding, removing, and managing items before checkout.
- **Razorpay Integration:** Seamless and secure payment processing through Razorpay.

## Timeline

The project timeline will be determined after a detailed scope definition phase. We will work with you to establish realistic milestones and delivery dates.

## Price Quote

Our pricing is based on an average hourly rate of $20. A detailed price quote will be provided once the project scope is clearly defined.

## Our Team

Our team consists of experienced developers, designers, and project managers with a proven track record in building successful mobile and web applications. We are committed to delivering high-quality solutions that meet your business objectives.

## Call to Action

We are excited about the opportunity to partner with you on this project. Please contact us to schedule a meeting to discuss your specific needs and how we can help you achieve your goals.

Best regards,
Lenk Solutions
`

  return proposalContent
}
