---
title: Why Notice and Comment is Cooked
draft: false
tags:
  - project
  - politics
  - favorites/prose
description:
created: 2025-12-29
modified:
holiday:
---
Back in 2023, while working at the Heritage Foundation, I helped draft a regulatory comment in response to a proposed change to the way that employees were vetted. My boss gave me background on the situation, a few key points that we needed to get in there, and told me to come up with whatever else I could find. My partner and I proceeded to throw the [entire Italian restaurant](24-9-16-Eureka) at the wall to see what would stick because my learned superior informed us that every unique substantive argument presented in a [regulatory comment](https://www.regulations.gov/learn) needed a response or rationale as to why it was wrong in order for the regulation to pass, otherwise it opened the way for a lawsuit to be filed because the regulation was [arbitrary and capricious](https://ballotpedia.org/Arbitrary-or-capricious_test). Because of this, agencies need to read each and every comment submitted to the docket just to be safe.

What this means is that beyond showing public opinion on an issue, or providing substantive reasons to continue or oppose regulations[^1], regulatory comments, especially at scale, are an effective tactic to both delay and distract agencies issuing regulations. This is why organizations like unions and advocacy groups, while they might include a letter for members to sign there name and submit as a comment, encourage their members or constituents to write their own letters in support or opposition to regulations because agencies have technology that can group duplicate comments so that they only need to be read once. This can be to stop an action from being made, but agencies generally can create justifications given sufficient lawyer man-hours; the real place this shines is in delaying regulatory action especially when a Presidential or legislative term is ending and delayed proposed regulations can be retracted or stopped by Congressional review.

Here's the fun part: it would be really easy to create unique letters for thousands or millions of interested citizens. Here are some of my ideas:
# Creating the Comments
## Mail Merge
The simplest option for mass comment generation is write the regulatory comment and then set fields in the comment were synonyms can be used. Include enough of these fields and you'll have technically distinct letters. All you need is Mail Merge.

This would allow you to use existing infrastructure and evade the most basic comment aggregating tools, though they might still be detected by current algorithms. To spice that up a bit, advocate mobilizers could encourage senders to write just one or two original lines which would again force all comments to be read while minimizing user effort. The alternative would be to have just one or two lines with extraordinarily complexity and wide variety of argumentation as well.

This method is [already used](https://www.wsj.com/video/thousands-of-fake-comments-on-net-neutrality-a-wsj-investigation/8E52172E-821C-4D89-A2AA-2820F30B8648) by several groups including [Issue Hound](https://www.issuehound.com/)[^2] which has commercialized the method.
## LLMs and further automation
AI generation of comments is also possible and while bulk production might not be the cheapest, for smaller agencies, inputting a rough draft of the major points an organization wants to outline and drafting hundreds or thousands of regulatory comments isn't beyond the realm of possibility. There's precedent for this as well, [7.7 million comments](https://ag.ny.gov/sites/default/files/oag-fakecommentsreport.pdf) were submitted in support for net neutrality by a single comp-sci student.

With the advent of functional LLMs, one could make a serious effort at stonewalling administrative agencies through sheer volume of slop thrown into the gears of their assistant general counsel's office.
# Maximizing Impact
Now that you have these thousands of comments, what can you do to spice them up and make sure that agencies deliberate on them maximally. Here are a few ideas:
## Automated Delivery
Now that you have thousands of unique regulatory comments, you need to deliver them, but what's easier than finding a thousand different people to submit comments? Doing it yourself with the help of automation.

On the one hand, this is frowned upon, on the other hand, this is an important regulation. Agencies might detect the automated submission, but can they really risk you putting something substantive into one or two of the comments they'd otherwise group by submitter? I'm not sure, but if you want to find out, try putting in some of that unique substance in with the rest. 
## Physical Delivery
Some agencies allow physical delivery of comments on proposed rule to the actual address of the agency. An enterprising individual equipped with the thousands of comments could submit them in bulk using a cart and boxes and force either mass OCR or hand assessment of hundreds and thousands of functionally identical notes, either way wasting taxpayer dollars in bulk.

Most agencies are wise enough to require an online filing.
## Prompt Injection
The federal government's AI implementation push means that it is likely that LLMs will be used by agencies to sort, filter, and triage comments. Prompt injection in submitted documents might be legally dangerous, but anonymous bulk automated filing with attacks interspersed could create a serious issue for agencies, especially if paired with a huge influx of comments submitted by citizens with a much lower threshold to participation and/or motivated individual actors.

Such attacks might try to convince the LLM that the rule being issued is inherently unethical and so cooperating with regulatory comments is immoral, that actually all of the comments lack substance, setting up a lawsuit, or that all comments are actually in agreement with the attacker, bricking a query, or worse, causing an agency to violate the arbitrary and capricious standard.
# What's to Be Done
All of this is great and all, but realistically speaking, no one wants a world where notice and comment has gone the way of the dodo. Basic solutions--strong identity requirements, filtering AI generated responses, and developing more robust AI systems to counter spam--are all difficult to implement and come with their own problems. Stronger identity requirements risk chilling speech, increasing surveillance, and adding unnecessary friction to an already obscure process, (though certain processes could circumvent those problems)[^3]; filtering AI responses risks ignoring valid criticism because it was developed by AI, or, worse, filtering out a crucial human response in a false positive and opening legal vulnerability; and developing better AI requires technology that doesn't exist, and when/if it does exist, better AI will make filtering the more difficult.

There's no silver bullet to answer this problem, but I expect that what we're going to see eventually is an amendment to the Administrative Procedures Act[^4], the end of physical comment submission[^5], and increasing sophistication of AI systems on both the proposing and commenting sides of the government divide.


[^1]: It's also worth noting that the purpose of regulatory comments isn't to identify which side shouts louder, but rather to give the agency relevant information about the costs and benefits of the proposed rule. 
	
	For more on this, read [Let Us Not Raise a Ruckus Over Net Neutrality](https://www.theregreview.org/2023/10/30/may-let-us-not-raise-a-ruckus-over-net-neutrality/)

[^2]: I really like how their [Twitter account](https://x.com/issuehound) has 6 followers and one tweet that says "Good things are coming soon." I guess they might be, but the current posting level doesn't give me a lot of hope. 

[^3]: Zero Knowledge Proofs could rectify this by verifying an identity record with a third-party without giving away an identity and some kind of CAPTCHA could prevent that process from being automated. This does require the commenter to trust the third-party. For more, read  [Online Age-Verification: Protecting Children and Privacy](https://americarenewing.com/issues/identity-on-the-internet-protecting-children-and-privacy-and-building-a-proof-of-humanity-regulatory-regime-for-an-ai-driven-internet/#:~:text=Application%20Beyond%20Age,the%20authenticated%20human.)

[^4]: What this would entail is beyond me, but I expect that something will change given the leaps and bounds that natural language processing has undergone

[^5]: This is the way that the wind is already blowing, and requiring people to submit only their own comments would solve this to an extent. Realistically, someone who's gone through the effort of generating hundreds or thousands of pages of slop will probably just submit it online, if only because printing is a lot more expensive than typing (and that isn't even discussing the postal costs)
