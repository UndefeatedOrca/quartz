---
title: "Different than a Veto: Modeling Impoundment"
draft: false
tags:
  - school/paper/GOVT322
  - politics
description: Submitted as Exam One for GOVT 322
created: 2026-02-15
modified:
holiday:
---
Presidential impoundment is an understudied influence (or potential influence on legislative action). Functioning similarly to an absolute line-item veto, the ability for a President to decline to spend appropriations is both controversial and complex, with substantial implications for legislature behavior. This paper offers a model of legislature action with the inclusion of a President willing to use the power of impoundment under a unified government, and with simple and supermajorities aligned against the President showing that impoundment power allows a President substantial control over legislative outcomes even when opposed by supermajorities in the legislature.
# Legislative Phenomena: Appropriations and Impoundment

Impoundment is the "President's power to decline to spend the full amount of what Congress appropriated."[^1] This highly controversial power, though restricted by the 1974 Impoundment Control Act (ICA), has seen much discussion in recent years with its prospective resuscitation floated by President Donald Trump in campaign materials.[^2] Others who argue in support of the power include current Office of Management and Budget director Russ Vought and several associated lawyers and analysts at the organization he founded, the Center for Renewing America, which also floated the proposal for pocket recissions which have a similar function as impoundment, but with significant limitations regarding when they can be used.[^3] Pocket rescissions were allowed by the Supreme Court, but the status of impoundment is debated and generally assumed to be illegal as the President has not yet challenged the constitutionality of the ICA.[^4]

Despite the legal gray area, the power of impoundment was used by several Presidents throughout history, from Washington's failure to spend all appropriated hospital department funds, Jefferson's refusal to buy gunboats for use on the Mississippi, Buchanan's impoundment of funds for public buildings in Illinois, to Franklin D. Roosevelt's refusal to spend funds for a variety of construction projects.[^5] These impoundments ceased in the Nixon administration with the passage of the aforementioned ICA, and the substitution of the power of impoundment with rescissions authority which allows the President to suggest reductions in appropriations (and, in the limited case of pocket rescissions, not spend at all). The renewed interest in the concept, combined with the lack of modeling done because of the presumed unconstitutionality of the practice makes it a ripe area of research especially given the possibility of tests of the ICA's constitutionality.
# Formal Model

The model is an infinite horizon bargaining model. A legislature is composed of a given number of legislators *n* and a President; each player is either conservative or liberal. The President possesses veto and impoundment authority. Conservatives prefer maximal conservative dollar allocations, while liberals prefer to allocate dollars to the liberal category. This stylizes competing partisan allocations while assuming for the sake of simplicity that bipartisan budget items are passed separately. Legislators, in addition to preferring maximal dollar allocation for their side also prefer minimal allocation of dollars to the opposing side and Presidents will impound as many dollars as possible while maximizing dollars for their own side. (Minimizing opposing party dollars functions as a decision tiebreaker while preferred dollar allocations remain the primary utility function.)

![[Pasted image 20260606153305.png]]
**Figure 1 -** Representation of model process; rectangles indicate legislative action, trapezoids indicate executive action, and rounded rectangles indicate outcomes.

At the beginning of the game, a legislator is randomly selected to propose how a fixed dollar will be allocated into two categories, conservative and liberal, with possible values ranging from 0 to the total budget, so long as the sum of conservative and liberal allocations is the whole of the budget. Each legislator has a probability $1/n$ of being selected. If the proposal receives $(n + 1)/2$ votes, it goes to the President to veto or pass. A bill that is vetoed goes back to the legislature and the veto is overridden and the bill passed if the bill received $2n/3$ votes. After a bill is passed, the President can impound some or all of the allocation, leaving only funds not impounded to be spent (impounded funds do not generate utility). If the President impounds funding, the legislature can repeal the whole allocation with $2n/3$ votes. If legislation fails to pass, is vetoed and the veto is not overridden, or the proposal is repealed, a new round begins with the selection of a new proposer, and the total amount to be allocation is discounted by a discount factor *δ* where the new budget is $budget - (budget*\ \delta)$.
# Predictions

Model predictions assume the structure of the model with a President and various legislative divisions of unified government and majorities (simple and super) of legislators of opposite persuasion to the President.
## Unified Government

Under a unified government, passing proposals will solely allocate the budget in ways preferred by the party in power. Any proposal made by a minority legislator will either be vetoed, if the total allocation of the dollar to the preferred party is less than the expected value of a majority proposal in the next round or passed and the minority dollars impounded.[^6] As such, equilibrium for majority legislators is a majority maximizing allocation, and minority legislators will zero majority dollars in proposals to force a new round and discount the total amount allocated to the majority side when a majority legislator is eventually chosen.
## Divided Government with a Simple Majority

Under a government where the legislature has a simple majority of the party opposite the President, strategies shift. In a non-iterated game where the President faces no consequences for impounding funds, equilibrium results in perpetual bargaining because the legislature will refuse to pass a bill in which the full opposite-party allocation will be impounded and the President will always impound funds for the party opposite his because the legislature is unable to inflict a cost for impoundment (as such, vetoes are irrelevant). However, in an iterated game, the President and legislature have a different result.

In games where the President is rewarded for not defecting (for example: an appropriation might need to be reauthorized yearly, so perpetual impoundment results in loss of future utility because the legislature knows that it will never receive any allocation but cooperation allows for some utility), equilibrium shifts so that the party opposing the President can successfully bargain for some allocation. Specifically, the allocation to the party opposite the President becomes the discount factor multiplied by the current budgets, because it is equivalent to what is otherwise lost by the President in forcing another round.
## Divided Government with a Supermajority

In governments where one party has a supermajority and the other controls the presidency the legislature gains two moves, overriding a presidential veto and repealing legislation, reverting the effect of impoundment at the cost of starting a new round.[^7] Equilibrium strategy for the supermajority party is to propose an allocation that gives the President's party the discount factor multiplied by the current budget, because that is the cost of a veto and for the President to impound the same amount from the legislature's allocation, because that is the cost of repeal to the legislature. As such, the legislature receives $budget - budget*2\delta$ and the President emerges with $budget*\delta$.
# Assumptions and Limitations

The model makes several assumptions that limit its direct applicability to Congressional politics. The first, is that it assumes a President with the authority and willingness to use impoundment, if impoundment remains in obscurity and the ICA unchallenged, the ICA is ruled unconstitutional by the Supreme Court, or the constitution is amended subsequent to a supportive Supreme Court ruling to eliminate impoundment, this framework is irrelevant. Second, the model assumes a binary divide between conservative and liberal projects and appropriations, where more realistic models would recognize that legislators and appropriations are rarely ideologically pure. A more complex model might include legislators and Presidents with ideal points across the ideological spectrum. It also might alter the utility function away from both sides wishing to spend money, instead creating a model similar to Primo's where conservatives prefer a lower level of spending and liberal executives spend more overall (in the absence of a spending limit).[^8] The model also assumes a dichotomous system where a majority is all that is required to pass legislation and does not model more than two sides or what happens when coalitions are required to pass legislation as is often the case in the United States Senate because of the filibuster rule. The model assumes that coalitions willing to support a bill would credibly threaten repeal without defections in the coalition. Finally, the model does not account for other policy items used in bargaining which cannot be impounded, which would weaken the apparent strength of impoundment seen in the model.

These assumptions, their correspondent limitations, and the inherent simplified nature of such modeling makes it the first step in greater understanding and modeling of Presidential impoundment, not the final word on the matter. More complex modeling is required for empirical comparisons as history has not seen a President wield impoundment power nearly as imperiously as the model projects.
# Reflection and Broader Implications

The outcomes of the model suggest that impoundment, if utilized, would be a powerful tool for Presidents to use to modify policy outcomes toward their own ends. Even so, Congress writes laws and the power to refuse to allocate toward specific projects desired by the President is of comparative power to the quasi-line-item veto of impoundment. Existing literature is limited on the topic of absolute veto authority and other impoundment stand-ins, though the dominance of impoundment power tracks with other studies like Nunnari 2021 which found that absolute veto power converges to full appropriation by the veto player.[^9] Further study on the topic of impoundment, rescissions, and pocket rescissions will be needed to fully understand these dormant phenomena as they wake from their long slumber to face the modern world.
# Bibliography

CRA Staff. *Primer: Utilizing Impoundment to Control Federal Spending*. The Center for Renewing America, 2024. https://americarenewing.com/primer-utilizing-impoundment-to-control-federal-spending/.

Kim, Juliana. "Supreme Court Allows Trump to Withhold \$4 Billion in Foreign Aid." World. *NPR*, September 26, 2025. https://www.npr.org/2025/09/26/nx-s1-5554825/supreme-court-trump-foreign-aid-pocket-rescission.

Miller, Wade. "Primer: A Pocket Rescission Strategy to Cut Spending." *The Center for Renewing America*, May 29, 2025. https://americarenewing.com/issues/primer-a-pocket-rescission-strategy-to-cut-spending/.

Nunnari, Salvatore. "Dynamic Legislative Bargaining with Veto Power: Theory and Experiments." *Games and Economic Behavior* 126 (March 2021): 186--230. https://doi.org/10.1016/j.geb.2020.11.006.

Paoletta, Mark. "The History of Impoundments Before the Impoundment Control Act of 1974." *The Center for Renewing America*, June 24, 2024. https://americarenewing.com/the-history-of-impoundments-before-the-impoundment-control-act-of-1974/.

Primo, David M. "STOP US BEFORE WE SPEND AGAIN: INSTITUTIONAL CONSTRAINTS ON GOVERNMENT SPENDING." *Economics & Politics* 18, no. 3 (November 2006): 269--312. https://doi.org/10.1111/j.1468-0343.2006.00171.x.

Trump. "Agenda47: Using Impoundment to Cut Waste, Stop Inflation, and Crush the Deep State." June 20, 2023. https://www.donaldjtrump.com/agenda47/agenda47-using-impoundment-to-cut-waste-stop-inflation-and-crush-the-deep-state.

[^1]: CRA Staff, *Primer: Utilizing Impoundment to Control Federal Spending* (The Center for Renewing America, 2024), https://americarenewing.com/primer-utilizing-impoundment-to-control-federal-spending/.

[^2]: Trump, "Agenda47: Using Impoundment to Cut Waste, Stop Inflation, and Crush the Deep State," June 20, 2023, https://www.donaldjtrump.com/agenda47/agenda47-using-impoundment-to-cut-waste-stop-inflation-and-crush-the-deep-state.

[^3]: Wade Miller, "Primer: A Pocket Rescission Strategy to Cut Spending," *The Center for Renewing America*, May 29, 2025, https://americarenewing.com/issues/primer-a-pocket-rescission-strategy-to-cut-spending/.

[^4]: Juliana Kim, "Supreme Court Allows Trump to Withhold \$4 Billion in Foreign Aid," World, *NPR*, September 26, 2025, https://www.npr.org/2025/09/26/nx-s1-5554825/supreme-court-trump-foreign-aid-pocket-rescission.

[^5]: Mark Paoletta, "The History of Impoundments Before the Impoundment Control Act of 1974," *The Center for Renewing America*, June 24, 2024, https://americarenewing.com/the-history-of-impoundments-before-the-impoundment-control-act-of-1974/.

[^6]: In a situation where minority members selected for proposals are not playing to minimize majority dollars, the size of a majority will vary the expected value of future rounds.

[^7]: The veto override is relevant because otherwise the President would veto the attempted repeal of appropriated funds.

[^8]: David M. Primo, "STOP US BEFORE WE SPEND AGAIN: INSTITUTIONAL CONSTRAINTS ON GOVERNMENT SPENDING," *Economics & Politics* 18, no. 3 (November 2006): 269--312, https://doi.org/10.1111/j.1468-0343.2006.00171.x.

[^9]: Salvatore Nunnari, "Dynamic Legislative Bargaining with Veto Power: Theory and Experiments," *Games and Economic Behavior* 126 (March 2021): 186--230, https://doi.org/10.1016/j.geb.2020.11.006.
