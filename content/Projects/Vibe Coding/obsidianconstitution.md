---
title: Obsidian Constitution Reference Plugin
draft: false
tags:
  - tech/vibecoding
  - unfinished
description:
created: 2026-04-22
modified:
holiday:
---
>[!warning] Warning
>I am only 90% sure that the actual text of the constitution is in this plugin

>[!note] Note/todo
>This might be better as referencing a json file rather than hardcoding text
>This also struggles to capture line breaks (maybe json file would help with this)

Inspired by the obsidian bible reference plugin, I vibecoded this plugin which is for the United States Constitution. Syntax is \==a[article#]s[section#]c[clause name/#] or \==[clause name] or use the sidebar button on the left.

To install: 
1. Create a folder: your vault\\.obsidian\plugins\obsidian-constitution-reference
2. Add the following files to that folder - name them as the heading indicates
3. Enable community plugins in obsidian
4. Refresh community plugins
5. Get going my friend
# main.js
```js
"use strict";

const { Plugin, EditorSuggest, SuggestModal, Notice, MarkdownView } = require("obsidian");

const ORDINAL_WORDS = {
  1: "First",
  2: "Second",
  3: "Third",
  4: "Fourth",
  5: "Fifth",
  6: "Sixth",
  7: "Seventh",
  8: "Eighth",
  9: "Ninth",
  10: "Tenth",
  11: "Eleventh",
  12: "Twelfth",
  13: "Thirteenth",
  14: "Fourteenth",
  15: "Fifteenth",
  16: "Sixteenth",
  17: "Seventeenth",
  18: "Eighteenth",
  19: "Nineteenth",
  20: "Twentieth",
  21: "Twenty-First",
  22: "Twenty-Second",
  23: "Twenty-Third",
  24: "Twenty-Fourth",
  25: "Twenty-Fifth",
  26: "Twenty-Sixth",
  27: "Twenty-Seventh"
};

function toRoman(num) {
  const numerals = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];
  let value = num;
  let result = "";
  for (const [arabic, roman] of numerals) {
    while (value >= arabic) {
      result += roman;
      value -= arabic;
    }
  }
  return result;
}

const PREAMBLE = "We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.";

const CONSTITUTION = {
  preamble: PREAMBLE,
  articles: {},
  amendments: {}
};

CONSTITUTION.articles = {
  1: {
    title: "Legislative Powers",
    sections: {
      1: { text: "All legislative Powers herein granted shall be vested in a Congress of the United States, which shall consist of a Senate and House of Representatives." },
      2: { text: "The House of Representatives shall be composed of Members chosen every second Year by the People of the several States, and the Electors in each State shall have the Qualifications requisite for Electors of the most numerous Branch of the State Legislature. No Person shall be a Representative who shall not have attained to the Age of twenty five Years, and been seven Years a Citizen of the United States, and who shall not, when elected, be an Inhabitant of that State in which he shall be chosen. Representatives and direct Taxes shall be apportioned among the several States which may be included within this Union, according to their respective Numbers, which shall be determined by adding to the whole Number of free Persons, including those bound to Service for a Term of Years, and excluding Indians not taxed, three fifths of all other Persons. The actual Enumeration shall be made within three Years after the first Meeting of the Congress of the United States, and within every subsequent Term of ten Years, in such Manner as they shall by Law direct. The Number of Representatives shall not exceed one for every thirty Thousand, but each State shall have at Least one Representative; and until such enumeration shall be made, the State of New Hampshire shall be entitled to chuse three, Massachusetts eight, Rhode Island and Providence Plantations one, Connecticut five, New-York six, New Jersey four, Pennsylvania eight, Delaware one, Maryland six, Virginia ten, North Carolina five, South Carolina five, and Georgia three. When vacancies happen in the Representation from any State, the Executive Authority thereof shall issue Writs of Election to fill such Vacancies. The House of Representatives shall choose their Speaker and other Officers; and shall have the sole Power of Impeachment." },
      3: { text: "The Senate of the United States shall be composed of two Senators from each State, chosen by the Legislature thereof, for six Years; and each Senator shall have one Vote. Immediately after they shall be assembled in Consequence of the first Election, they shall be divided as equally as may be into three Classes. The Seats of the Senators of the first Class shall be vacated at the Expiration of the second Year, of the second Class at the Expiration of the fourth Year, and of the third Class at the Expiration of the sixth Year, so that one third may be chosen every second Year; and if Vacancies happen by Resignation, or otherwise, during the Recess of the Legislature of any State, the Executive thereof may make temporary Appointments until the next Meeting of the Legislature, which shall then fill such Vacancies. No Person shall be a Senator who shall not have attained to the Age of thirty Years, and been nine Years a Citizen of the United States, and who shall not, when elected, be an Inhabitant of that State for which he shall be chosen. The Vice President of the United States shall be President of the Senate, but shall have no Vote, unless they be equally divided. The Senate shall choose their other Officers, and also a President pro tempore, in the Absence of the Vice President, or when he shall exercise the Office of President of the United States. The Senate shall have the sole Power to try all Impeachments. When sitting for that Purpose, they shall be on Oath or Affirmation. When the President of the United States is tried, the Chief Justice shall preside: and no Person shall be convicted without the Concurrence of two thirds of the Members present. Judgment in Cases of Impeachment shall not extend further than to removal from Office, and disqualification to hold and enjoy any Office of honor, Trust or Profit under the United States: but the Party convicted shall nevertheless be liable and subject to Indictment, Trial, Judgment and Punishment, according to Law." },
      4: { text: "The Times, Places and Manner of holding Elections for Senators and Representatives, shall be prescribed in each State by the Legislature thereof; but the Congress may at any time by Law make or alter such Regulations, except as to the Places of chusing Senators. The Congress shall assemble at least once in every Year, and such Meeting shall be on the first Monday in December, unless they shall by Law appoint a different Day." },
      5: { text: "Each House shall be the Judge of the Elections, Returns and Qualifications of its own Members, and a Majority of each shall constitute a Quorum to do Business; but a smaller Number may adjourn from day to day, and may be authorized to compel the Attendance of absent Members, in such Manner, and under such Penalties as each House may provide. Each House may determine the Rules of its Proceedings, punish its Members for disorderly Behaviour, and, with the Concurrence of two thirds, expel a Member. Each House shall keep a Journal of its Proceedings, and from time to time publish the same, excepting such Parts as may in their Judgment require Secrecy; and the Yeas and Nays of the Members of either House on any question shall, at the Desire of one fifth of those Present, be entered on the Journal. Neither House, during the Session of Congress, shall, without the Consent of the other, adjourn for more than three days, nor to any other Place than that in which the two Houses shall be sitting." },
      6: { text: "The Senators and Representatives shall receive a Compensation for their Services, to be ascertained by Law, and paid out of the Treasury of the United States. They shall in all Cases, except Treason, Felony and Breach of the Peace, be privileged from Arrest during their Attendance at the Session of their respective Houses, and in going to and returning from the same; and for any Speech or Debate in either House, they shall not be questioned in any other Place. No Senator or Representative shall, during the Time for which he was elected, be appointed to any civil Office under the Authority of the United States which shall have been created, or the Emoluments whereof shall have been encreased during such time; and no Person holding any Office under the United States, shall be a Member of either House during his Continuance in Office." },
      7: { text: "All Bills for raising Revenue shall originate in the House of Representatives; but the Senate may propose or concur with Amendments as on other Bills. Every Bill which shall have passed the House of Representatives and the Senate shall, before it become a Law, be presented to the President of the United States. If he approve he shall sign it, but if not he shall return it, with his Objections, to that House in which it shall have originated, who shall enter the Objections at large on their Journal, and proceed to reconsider it. If after such Reconsideration two thirds of that House shall agree to pass the Bill, it shall be sent, together with the Objections, to the other House, by which it shall likewise be reconsidered, and if approved by two thirds of that House, it shall become a Law. In all such Cases the Votes of both Houses shall be determined by yeas and Nays, and the Names of the Persons voting for and against the Bill shall be entered on the Journal of each House respectively. If any Bill shall not be returned by the President within ten Days (Sundays excepted) after it shall have been presented to him, the Same shall be a Law, in like Manner as if he had signed it, unless the Congress by their Adjournment prevent its Return, in which Case it shall not be a Law. Every Order, Resolution, or Vote to which the Concurrence of the Senate and House of Representatives may be necessary shall be presented to the President of the United States; and before the Same shall take Effect, shall be approved by him, or being disapproved by him, shall be repassed by two thirds of the Senate and House of Representatives according to the Rules and Limitations prescribed in the Case of a Bill." },
      8: { text: "The Congress shall have Power To lay and collect Taxes, Duties, Imposts and Excises, to pay the Debts and provide for the common Defence and general Welfare of the United States; but all Duties, Imposts and Excises shall be uniform throughout the United States. To borrow Money on the credit of the United States. To regulate Commerce with foreign Nations, and among the several States, and with the Indian Tribes. To establish an uniform Rule of Naturalization, and uniform Laws on the subject of Bankruptcies throughout the United States. To coin Money, regulate the Value thereof, and of foreign Coin, and fix the Standard of Weights and Measures. To provide for the Punishment of counterfeiting the Securities and current Coin of the United States. To establish Post Offices and post Roads. To promote the Progress of Science and useful Arts, by securing for limited Times to Authors and Inventors the exclusive Right to their respective Writings and Discoveries. To constitute Tribunals inferior to the supreme Court. To define and punish Piracies and Felonies committed on the high Seas, and Offenses against the Law of Nations. To declare War, grant Letters of Marque and Reprisal, and make Rules concerning Captures on Land and Water. To raise and support Armies, but no Appropriation of Money to that Use shall be for a longer Term than two Years. To provide and maintain a Navy. To make Rules for the Government and Regulation of the land and naval Forces. To provide for calling forth the Militia to execute the Laws of the Union, suppress Insurrections and repel Invasions. To provide for organizing, arming, and disciplining, the Militia, and for governing such part of them as may be employed in the Service of the United States, reserving to the States respectively the Appointment of the Officers, and the Authority of training the Militia according to the discipline prescribed by Congress. To exercise exclusive Legislation in all Cases whatsoever, over such District as may become the Seat of the Government of the United States, and to exercise like Authority over all Places purchased by the Consent of the Legislature of the State in which the Same shall be, for the Erection of Forts, Magazines, Arsenals, dock-Yards, and other needful Buildings. To make all Laws which shall be necessary and proper for carrying into Execution the foregoing Powers, and all other Powers vested by this Constitution in the Government of the United States, or in any Department or Officer thereof." },
      9: { text: "The Migration or Importation of such Persons as any of the States now existing shall think proper to admit, shall not be prohibited by the Congress prior to the Year one thousand eight hundred and eight, but a Tax or duty may be imposed on such Importation, not exceeding ten dollars for each Person. The Privilege of the Writ of Habeas Corpus shall not be suspended, unless when in Cases of Rebellion or Invasion the public Safety may require it. No Bill of Attainder or ex post facto Law shall be passed. No Capitation, or other direct, Tax shall be laid, unless in Proportion to the Census or Enumeration herein before directed to be taken. No Tax or Duty shall be laid on Articles exported from any State. No Preference shall be given by any Regulation of Commerce or Revenue to the Ports of one State over those of another: nor shall Vessels bound to, or from, one State, be obliged to enter, clear, or pay Duties in another. No Money shall be drawn from the Treasury, but in Consequence of Appropriations made by Law; and a regular Statement and Account of the Receipts and Expenditures of all public Money shall be published from time to time. No Title of Nobility shall be granted by the United States: and no Person holding any Office of Profit or Trust under them, shall, without the Consent of the Congress, accept of any present, Emolument, Office, or Title, of any kind whatever, from any King, Prince, or foreign State." },
      10: { text: "No State shall enter into any Treaty, Alliance, or Confederation; grant Letters of Marque and Reprisal; coin Money; emit Bills of Credit; make any Thing but gold and silver Coin a Tender in Payment of Debts; pass any Bill of Attainder, ex post facto Law, or Law impairing the Obligation of Contracts, or grant any Title of Nobility. No State shall, without the Consent of the Congress, lay any Imposts or Duties on Imports or Exports, except what may be absolutely necessary for executing its inspection Laws; and the net Produce of all Duties and Imposts, laid by any State on Imports or Exports, shall be for the Use of the Treasury of the United States; and all such Laws shall be subject to the Revision and Control of the Congress. No State shall, without the Consent of Congress, lay any Duty of Tonnage, keep Troops, or Ships of War in time of Peace, enter into any Agreement or Compact with another State, or with a foreign Power, or engage in War, unless actually invaded, or in such imminent Danger as will not admit of delay." }
    }
  },
  2: {
    title: "Executive Powers",
    sections: {
      1: { text: "The executive Power shall be vested in a President of the United States of America. He shall hold his Office during the Term of four Years, and, together with the Vice President, chosen for the same Term, be elected as follows. Each State shall appoint, in such Manner as the Legislature thereof may direct, a Number of Electors equal to the whole Number of Senators and Representatives to which the State may be entitled in the Congress: but no Senator or Representative, or Person holding an Office of Trust or Profit under the United States, shall be appointed an Elector. The Electors shall meet in their respective States, and vote by Ballot for two Persons, of whom one at least shall not be an Inhabitant of the same State with themselves. They shall make a List of all the Persons voted for, and of the Number of Votes for each, which List they shall sign and certify, and transmit sealed to the Seat of the Government of the United States, directed to the President of the Senate. The President of the Senate shall, in the Presence of the Senate and House of Representatives, open all the Certificates, and the Votes shall then be counted. The Person having the greatest Number of Votes shall be the President, if such Number be a Majority of the whole Number of Electors appointed; and if there be more than one who have such Majority, and have an equal Number of Votes, then the House of Representatives shall immediately choose by Ballot one of them for President; and if no Person have a Majority, then from the five highest on the List the said House shall in like Manner choose the President. But in choosing the President, the Votes shall be taken by States, the Representation from each State having one Vote; a quorum for this Purpose shall consist of a Member or Members from two thirds of the States, and a Majority of all the States shall be necessary to a Choice. In every Case, after the Choice of the President, the Person having the greatest Number of Votes of the Electors shall be the Vice President. But if there should remain two or more who have equal Votes, the Senate shall choose from them by Ballot the Vice President. The Congress may determine the Time of choosing the Electors, and the Day on which they shall give their Votes; which Day shall be the same throughout the United States. No Person except a natural born Citizen, or a Citizen of the United States, at the time of the Adoption of this Constitution, shall be eligible to the Office of President; neither shall any Person be eligible to that Office who shall not have attained to the Age of thirty five Years, and been fourteen Years a Resident within the United States. In Case of the Removal of the President from Office, or of his Death, Resignation, or Inability to discharge the Powers and Duties of the said Office, the Same shall devolve on the Vice President, and the Congress may by Law provide for the Case of Removal, Death, Resignation or Inability, both of the President and Vice President, declaring what Officer shall then act as President, and such Officer shall act accordingly until the Disability be removed, or a President shall be elected. The President shall, at stated Times, receive for his Services, a Compensation which shall neither be increased nor diminished during the Period for which he shall have been elected, and he shall not receive within that Period any other Emolument from the United States, or any of them. Before he enter on the Execution of his Office, he shall take the following Oath or Affirmation: I do solemnly swear (or affirm) that I will faithfully execute the Office of President of the United States, and will to the best of my Ability, preserve, protect and defend the Constitution of the United States." },
      2: { text: "The President shall be Commander in Chief of the Army and Navy of the United States, and of the Militia of the several States, when called into the actual Service of the United States. He may require the Opinion, in writing, of the principal Officer in each of the executive Departments, upon any Subject relating to the Duties of their respective Offices, and he shall have Power to grant Reprieves and Pardons for Offenses against the United States, except in Cases of Impeachment. He shall have Power, by and with the Advice and Consent of the Senate, to make Treaties, provided two thirds of the Senators present concur; and he shall nominate, and by and with the Advice and Consent of the Senate, shall appoint Ambassadors, other public Ministers and Consuls, Judges of the supreme Court, and all other Officers of the United States whose Appointments are not herein otherwise provided for, and which shall be established by Law: but the Congress may by Law vest the Appointment of such inferior Officers, as they think proper, in the President alone, in the Courts of Law, or in the Heads of Departments. The President shall have Power to fill up all Vacancies that may happen during the Recess of the Senate, by granting Commissions which shall expire at the End of their next Session." },
      3: { text: "He shall from time to time give to the Congress Information of the State of the Union, and recommend to their Consideration such Measures as he shall judge necessary and expedient. He may, on extraordinary Occasions, convene both Houses, or either of them, and in Case of Disagreement between them, with Respect to the Time of Adjournment, he may adjourn them to such Time as he shall think proper. He shall receive Ambassadors and other public Ministers. He shall take Care that the Laws be faithfully executed, and shall Commission all the Officers of the United States." },
      4: { text: "The President, Vice President and all civil Officers of the United States, shall be removed from Office on Impeachment for, and Conviction of, Treason, Bribery, or other high Crimes and Misdemeanors." }
    }
  },
  3: {
    title: "Judicial Powers",
    sections: {
      1: { text: "The judicial Power of the United States shall be vested in one supreme Court, and in such inferior Courts as the Congress may from time to time ordain and establish. The Judges, both of the supreme and inferior Courts, shall hold their Offices during good Behaviour, and shall, at stated Times, receive for their Services, a Compensation, which shall not be diminished during their Continuance in Office." },
      2: { text: "The judicial Power shall extend to all Cases, in Law and Equity, arising under this Constitution, the Laws of the United States, and Treaties made, or which shall be made, under their Authority; to all Cases affecting Ambassadors, other public Ministers and Consuls; to all Cases of admiralty and maritime Jurisdiction; to Controversies to which the United States shall be a Party; to Controversies between two or more States; between a State and Citizens of another State; between Citizens of different States; between Citizens of the same State claiming Lands under Grants of different States, and between a State, or the Citizens thereof, and foreign States, Citizens or Subjects. In all Cases affecting Ambassadors, other public Ministers and Consuls, and those in which a State shall be Party, the supreme Court shall have original Jurisdiction. In all the other Cases before mentioned, the supreme Court shall have appellate Jurisdiction, both as to Law and Fact, with such Exceptions, and under such Regulations as the Congress shall make. The Trial of all Crimes, except in Cases of Impeachment, shall be by Jury; and such Trial shall be held in the State where the said Crimes shall have been committed; but when not committed within any State, the Trial shall be at such Place or Places as the Congress may by Law have directed." },
      3: { text: "Treason against the United States shall consist only in levying War against them, or in adhering to their Enemies, giving them Aid and Comfort. No Person shall be convicted of Treason unless on the Testimony of two Witnesses to the same overt Act, or on Confession in open Court. The Congress shall have Power to declare the Punishment of Treason, but no Attainder of Treason shall work Corruption of Blood, or Forfeiture except during the Life of the Person attainted." }
    }
  },
  4: {
    title: "Relations Among the States",
    sections: {
      1: { text: "Full Faith and Credit shall be given in each State to the public Acts, Records, and judicial Proceedings of every other State. And the Congress may by general Laws prescribe the Manner in which such Acts, Records and Proceedings shall be proved, and the Effect thereof." },
      2: { text: "The Citizens of each State shall be entitled to all Privileges and Immunities of Citizens in the several States. A Person charged in any State with Treason, Felony, or other Crime, who shall flee from Justice, and be found in another State, shall on demand of the executive Authority of the State from which he fled, be delivered up, to be removed to the State having Jurisdiction of the Crime. No Person held to Service or Labour in one State, under the Laws thereof, escaping into another, shall, in Consequence of any Law or Regulation therein, be discharged from such Service or Labour, but shall be delivered up on Claim of the Party to whom such Service or Labour may be due." },
      3: { text: "New States may be admitted by the Congress into this Union; but no new State shall be formed or erected within the Jurisdiction of any other State, nor any State be formed by the Junction of two or more States, or Parts of States, without the Consent of the Legislatures of the States concerned as well as of the Congress. The Congress shall have Power to dispose of and make all needful Rules and Regulations respecting the Territory or other Property belonging to the United States; and nothing in this Constitution shall be so construed as to Prejudice any Claims of the United States, or of any particular State." },
      4: { text: "The United States shall guarantee to every State in this Union a Republican Form of Government, and shall protect each of them against Invasion; and on Application of the Legislature, or of the Executive when the Legislature cannot be convened, against domestic Violence." }
    }
  }
};

Object.assign(CONSTITUTION.articles, {
  5: {
    title: "Amendment Process",
    sections: {
      1: { text: "The Congress, whenever two thirds of both Houses shall deem it necessary, shall propose Amendments to this Constitution, or, on the Application of the Legislatures of two thirds of the several States, shall call a Convention for proposing Amendments, which, in either Case, shall be valid to all Intents and Purposes, as Part of this Constitution, when ratified by the Legislatures of three fourths of the several States, or by Conventions in three fourths thereof, as the one or the other Mode of Ratification may be proposed by the Congress; provided that no Amendment which may be made prior to the Year One thousand eight hundred and eight shall in any Manner affect the first and fourth Clauses in the Ninth Section of the first Article; and that no State, without its Consent, shall be deprived of its equal Suffrage in the Senate." }
    }
  },
  6: {
    title: "Debts, Supremacy, and Oaths",
    sections: {
      1: { text: "All Debts contracted and Engagements entered into, before the Adoption of this Constitution, shall be as valid against the United States under this Constitution, as under the Confederation. This Constitution, and the Laws of the United States which shall be made in Pursuance thereof; and all Treaties made, or which shall be made, under the Authority of the United States, shall be the supreme Law of the Land; and the Judges in every State shall be bound thereby, any Thing in the Constitution or Laws of any State to the Contrary notwithstanding. The Senators and Representatives before mentioned, and the Members of the several State Legislatures, and all executive and judicial Officers, both of the United States and of the several States, shall be bound by Oath or Affirmation, to support this Constitution; but no religious Test shall ever be required as a Qualification to any Office or public Trust under the United States." }
    }
  },
  7: {
    title: "Ratification",
    sections: {
      1: { text: "The Ratification of the Conventions of nine States shall be sufficient for the Establishment of this Constitution between the States so ratifying the Same." }
    }
  }
});

CONSTITUTION.amendments = {
  1: { title: "First Amendment", text: "Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble, and to petition the Government for a redress of grievances." },
  2: { title: "Second Amendment", text: "A well regulated Militia, being necessary to the security of a free State, the right of the people to keep and bear Arms, shall not be infringed." },
  3: { title: "Third Amendment", text: "No Soldier shall, in time of peace be quartered in any house, without the consent of the Owner, nor in time of war, but in a manner to be prescribed by law." },
  4: { title: "Fourth Amendment", text: "The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated, and no Warrants shall issue, but upon probable cause, supported by Oath or affirmation, and particularly describing the place to be searched, and the persons or things to be seized." },
  5: { title: "Fifth Amendment", text: "No person shall be held to answer for a capital, or otherwise infamous crime, unless on a presentment or indictment of a Grand Jury, except in cases arising in the land or naval forces, or in the Militia, when in actual service in time of War or public danger; nor shall any person be subject for the same offense to be twice put in jeopardy of life or limb; nor shall be compelled in any criminal case to be a witness against himself, nor be deprived of life, liberty, or property, without due process of law; nor shall private property be taken for public use, without just compensation." },
  6: { title: "Sixth Amendment", text: "In all criminal prosecutions, the accused shall enjoy the right to a speedy and public trial, by an impartial jury of the State and district wherein the crime shall have been committed, which district shall have been previously ascertained by law, and to be informed of the nature and cause of the accusation; to be confronted with the witnesses against him; to have compulsory process for obtaining witnesses in his favor, and to have the Assistance of Counsel for his defence." },
  7: { title: "Seventh Amendment", text: "In Suits at common law, where the value in controversy shall exceed twenty dollars, the right of trial by jury shall be preserved, and no fact tried by a jury, shall be otherwise reexamined in any Court of the United States, than according to the rules of the common law." },
  8: { title: "Eighth Amendment", text: "Excessive bail shall not be required, nor excessive fines imposed, nor cruel and unusual punishments inflicted." },
  9: { title: "Ninth Amendment", text: "The enumeration in the Constitution, of certain rights, shall not be construed to deny or disparage others retained by the people." },
  10: { title: "Tenth Amendment", text: "The powers not delegated to the United States by the Constitution, nor prohibited by it to the States, are reserved to the States respectively, or to the people." },
  11: { title: "Eleventh Amendment", text: "The Judicial power of the United States shall not be construed to extend to any suit in law or equity, commenced or prosecuted against one of the United States by Citizens of another State, or by Citizens or Subjects of any Foreign State." },
  12: { title: "Twelfth Amendment", text: "The Electors shall meet in their respective states and vote by ballot for President and Vice-President, one of whom, at least, shall not be an inhabitant of the same state with themselves; they shall name in their ballots the person voted for as President, and in distinct ballots the person voted for as Vice-President. They shall make distinct lists of all persons voted for as President, and of all persons voted for as Vice-President, and of the number of votes for each, which lists they shall sign and certify, and transmit sealed to the seat of the government of the United States, directed to the President of the Senate. The President of the Senate shall, in the presence of the Senate and House of Representatives, open all the certificates and the votes shall then be counted. The person having the greatest Number of votes for President shall be the President, if such number be a majority of the whole number of Electors appointed; and if no person have such majority, then from the persons having the highest numbers, not exceeding three, on the list of those voted for as President, the House of Representatives shall choose immediately, by ballot, the President. But in choosing the President, the votes shall be taken by states, the representation from each state having one vote; a quorum for this purpose shall consist of a member or members from two thirds of the states, and a majority of all the states shall be necessary to a choice. If the House of Representatives shall not choose a President whenever the right of choice shall devolve upon them, before the fourth day of March next following, then the Vice-President shall act as President, as in the case of the death or other constitutional disability of the President. The person having the greatest Number of votes as Vice-President shall be the Vice-President, if such number be a majority of the whole number of Electors appointed, and if no person have a majority, then from the two highest numbers on the list, the Senate shall choose the Vice-President; a quorum for the purpose shall consist of two thirds of the whole number of Senators, and a majority of the whole number shall be necessary to a choice. But no person constitutionally ineligible to the office of President shall be eligible to that of Vice-President of the United States." }
};

Object.assign(CONSTITUTION.amendments, {
  13: {
    title: "Thirteenth Amendment",
    sections: {
      1: { text: "Neither slavery nor involuntary servitude, except as a punishment for crime whereof the party shall have been duly convicted, shall exist within the United States, or any place subject to their jurisdiction." },
      2: { text: "Congress shall have power to enforce this article by appropriate legislation." }
    }
  },
  14: {
    title: "Fourteenth Amendment",
    sections: {
      1: { text: "All persons born or naturalized in the United States, and subject to the jurisdiction thereof, are citizens of the United States and of the State wherein they reside. No State shall make or enforce any law which shall abridge the privileges or immunities of citizens of the United States. Nor shall any State deprive any person of life, liberty, or property, without due process of law. Nor deny to any person within its jurisdiction the equal protection of the laws." },
      2: { text: "Representatives shall be apportioned among the several States according to their respective numbers, counting the whole number of persons in each State, excluding Indians not taxed. But when the right to vote at any election for the choice of electors for President and Vice-President of the United States, Representatives in Congress, the Executive and Judicial officers of a State, or the members of the Legislature thereof, is denied to any of the male inhabitants of such State, being twenty-one years of age, and citizens of the United States, or in any way abridged, except for participation in rebellion, or other crime, the basis of representation therein shall be reduced in the proportion which the number of such male citizens shall bear to the whole number of male citizens twenty-one years of age in such State." },
      3: { text: "No person shall be a Senator or Representative in Congress, or elector of President and Vice-President, or hold any office, civil or military, under the United States, or under any State, who, having previously taken an oath, as a member of Congress, or as an officer of the United States, or as a member of any State legislature, or as an executive or judicial officer of any State, to support the Constitution of the United States, shall have engaged in insurrection or rebellion against the same, or given aid or comfort to the enemies thereof. But Congress may by a vote of two-thirds of each House, remove such disability." },
      4: { text: "The validity of the public debt of the United States, authorized by law, including debts incurred for payment of pensions and bounties for services in suppressing insurrection or rebellion, shall not be questioned. But neither the United States nor any State shall assume or pay any debt or obligation incurred in aid of insurrection or rebellion against the United States, or any claim for the loss or emancipation of any slave; but all such debts, obligations and claims shall be held illegal and void." },
      5: { text: "The Congress shall have power to enforce, by appropriate legislation, the provisions of this article." }
    }
  },
  15: {
    title: "Fifteenth Amendment",
    sections: {
      1: { text: "The right of citizens of the United States to vote shall not be denied or abridged by the United States or by any State on account of race, color, or previous condition of servitude–" },
      2: { text: "The Congress shall have power to enforce this article by appropriate legislation." }
    }
  },
  16: { title: "Sixteenth Amendment", text: "The Congress shall have power to lay and collect taxes on incomes, from whatever source derived, without apportionment among the several States, and without regard to any census or enumeration." },
  17: { title: "Seventeenth Amendment", text: "The Senate of the United States shall be composed of two Senators from each State, elected by the people thereof, for six years; and each Senator shall have one vote. The electors in each State shall have the qualifications requisite for electors of the most numerous branch of the State legislatures. When vacancies happen in the representation of any State in the Senate, the executive authority of such State shall issue writs of election to fill such vacancies: provided, that the legislature of any State may empower the executive thereof to make temporary appointments until the people fill the vacancies by election as the legislature may direct. This amendment shall not be so construed as to affect the election or term of any Senator chosen before it becomes valid as part of the Constitution." },
  18: {
    title: "Eighteenth Amendment",
    sections: {
      1: { text: "After one year from the ratification of this article the manufacture, sale, or transportation of intoxicating liquors within, the importation thereof into, or the exportation thereof from the United States and all territory subject to the jurisdiction thereof for beverage purposes is hereby prohibited." },
      2: { text: "The Congress and the several States shall have concurrent power to enforce this article by appropriate legislation." },
      3: { text: "This article shall be inoperative unless it shall have been ratified as an amendment to the Constitution by the legislatures of the several States, as provided in the Constitution, within seven years from the date of the submission hereof to the States by the Congress." }
    }
  },
  19: { title: "Nineteenth Amendment", text: "The right of citizens of the United States to vote shall not be denied or abridged by the United States or by any State on account of sex. Congress shall have power to enforce this article by appropriate legislation." },
  20: {
    title: "Twentieth Amendment",
    sections: {
      1: { text: "The terms of the President and Vice President shall end at noon on the twentieth day of January, and the terms of Senators and Representatives at noon on the third day of January, of the years in which such terms would have ended if this article had not been ratified; and the terms of their successors shall then begin." },
      2: { text: "The Congress shall assemble at least once in every year, and such meeting shall begin at noon on the third day of January, unless they shall by law appoint a different day." },
      3: { text: "If, at the time fixed for the beginning of the term of the President, the President elect shall have died, the Vice President elect shall become President. If a President shall not have been chosen before the time fixed for the beginning of his term, or if the President elect shall have failed to qualify, then the Vice President elect shall act as President until a President shall have qualified. The Congress may by law provide for the case wherein neither a President elect nor a Vice President elect shall have qualified, declaring who shall then act as President, or the manner in which one who is to act shall be selected, and such person shall act accordingly until a President or Vice President shall have qualified." },
      4: { text: "The Congress may by law provide for the case of the death of any of the persons from whom the House of Representatives may choose a President whenever the right of choice shall have devolved upon them, and for the case of the death of any of the persons from whom the Senate may choose a Vice President whenever the right of choice shall have devolved upon them." },
      5: { text: "Sections 1 and 2 shall take effect on the fifteenth day of October following the ratification of this article." },
      6: { text: "This article shall be inoperative unless it shall have been ratified as an amendment to the Constitution by the legislatures of three-fourths of the several States within seven years from the date of its submission." }
    }
  }
});

Object.assign(CONSTITUTION.amendments, {
  21: {
    title: "Twenty-First Amendment",
    sections: {
      1: { text: "The eighteenth article of amendment to the Constitution of the United States is hereby repealed." },
      2: { text: "The transportation or importation into any State, Territory, or possession of the United States for delivery or use therein of intoxicating liquors, in violation of the laws thereof, is hereby prohibited." },
      3: { text: "This article shall be inoperative unless it shall have been ratified as an amendment to the Constitution by conventions in the several States, as provided in the Constitution, within seven years from the date of the submission hereof to the States by the Congress." }
    }
  },
  22: {
    title: "Twenty-Second Amendment",
    sections: {
      1: { text: "No person shall be elected to the office of the President more than twice, and no person who has held the office of President, or acted as President, for more than two years of a term to which some other person was elected President shall be elected to the office of President more than once. But this Article shall not apply to any person holding the office of President when this Article was proposed by the Congress, and shall not prevent any person who may be holding the office of President, or acting as President, during the term within which this Article becomes operative from holding the office of President or acting as President during the remainder of such term." },
      2: { text: "This article shall be inoperative unless it shall have been ratified as an amendment to the Constitution by the legislatures of three-fourths of the several States within seven years from the date of its submission to the States by the Congress." }
    }
  },
  23: { title: "Twenty-Third Amendment", text: "The District constituting the seat of Government of the United States shall appoint in such manner as the Congress may direct: A number of electors of President and Vice President equal to the whole number of Senators and Representatives in Congress to which the District would be entitled if it were a State, but in no event more than the least populous State. They shall be in addition to those appointed by the States, but they shall be considered, for the purposes of the election of President and Vice President, to be electors appointed by a State; and they shall meet in the District and perform such duties as provided by the twelfth article of amendment." },
  24: {
    title: "Twenty-Fourth Amendment",
    sections: {
      1: { text: "The right of citizens of the United States to vote in any primary or other election for President or Vice President, for electors for President or Vice President, or for Senator or Representative in Congress, shall not be denied or abridged by the United States or any State by reason of failure to pay any poll tax or other tax." },
      2: { text: "The Congress shall have power to enforce this article by appropriate legislation." }
    }
  },
  25: {
    title: "Twenty-Fifth Amendment",
    sections: {
      1: { text: "In case of the removal of the President from office or of his death or resignation, the Vice President shall become President." },
      2: { text: "Whenever there is a vacancy in the office of the Vice President, the President shall nominate a Vice President who shall take office upon confirmation by a majority vote of both Houses of Congress." },
      3: { text: "Whenever the President transmits to the President pro tempore of the Senate and the Speaker of the House of Representatives his written declaration that he is unable to discharge the powers and duties of his office, and until he transmits to them a written declaration to the contrary, such powers and duties shall be discharged by the Vice President as Acting President." },
      4: { text: "Whenever the Vice President and a majority of either the principal officers of the executive departments or of such other body as Congress may by law provide transmit to the President pro tempore of the Senate and the Speaker of the House of Representatives their written declaration that the President is unable to discharge the powers and duties of his office, the Vice President shall immediately assume the powers and duties of the office as Acting President. Thereafter, when the President transmits to the President pro tempore of the Senate and the Speaker of the House of Representatives his written declaration that no inability exists, he shall resume the powers and duties of his office unless the Vice President and a majority of either the principal officers of the executive department or of such other body as Congress may by law provide transmit within four days to the President pro tempore of the Senate and the Speaker of the House of Representatives their written declaration that the President is unable to discharge the powers and duties of his office. Thereupon Congress shall decide the issue, assembling within forty-eight hours for that purpose if not in session. If the Congress, within twenty-one days after receipt of the latter written declaration, or, if Congress is not in session, within twenty-one days after Congress is required to assemble, determines by two-thirds vote of both Houses that the President is unable to discharge the powers and duties of his office, the Vice President shall continue to discharge the same as Acting President; otherwise, the President shall resume the powers and duties of his office." }
    }
  },
  26: {
    title: "Twenty-Sixth Amendment",
    sections: {
      1: { text: "The right of citizens of the United States, who are eighteen years of age or older, to vote shall not be denied or abridged by the United States or by any State on account of age." },
      2: { text: "The Congress shall have power to enforce this article by appropriate legislation." }
    }
  },
  27: { title: "Twenty-Seventh Amendment", text: "No law, varying the compensation for the services of the Senators and Representatives, shall take effect, until an election of Representatives shall have intervened." }
});

function formatReference(parsed) {
  const sourceLabel = parsed.type === "article"
    ? `Article ${toRoman(parsed.number)}`
    : `${ORDINAL_WORDS[parsed.number] || `Amendment ${parsed.number}`} Amendment`;
  let sectionLabel = "";
  if (parsed.section) {
    sectionLabel = parsed.sectionEnd
      ? `, Sections ${parsed.section}–${parsed.sectionEnd}`
      : `, Section ${parsed.section}`;
  }
  let clauseLabel = "";
  if (parsed.clause) {
    clauseLabel = parsed.clauseEnd
      ? `, Clauses ${parsed.clause}–${parsed.clauseEnd}`
      : `, Clause ${parsed.clause}`;
  }
  return `${sourceLabel}${sectionLabel}${clauseLabel}`;
}


// Hardcoded clause texts keyed by "arXsYcZ" or "amXsYcZ"
// Clause numbers follow established legal/scholarly convention per Wikipedia
const CLAUSES = {
  "ar1s1c1":  { name: "Legislative Vesting Clause", text: "All legislative Powers herein granted shall be vested in a Congress of the United States, which shall consist of a Senate and House of Representatives." },
  "ar1s2c1":  { name: "Elections Clause (House)", text: "The House of Representatives shall be composed of Members chosen every second Year by the People of the several States, and the Electors in each State shall have the Qualifications requisite for Electors of the most numerous Branch of the State Legislature." },
  "ar1s2c2":  { name: "Qualifications Clause (House)", text: "No Person shall be a Representative who shall not have attained to the Age of twenty five Years, and been seven Years a Citizen of the United States, and who shall not, when elected, be an Inhabitant of that State in which he shall be chosen." },
  "ar1s2c3":  { name: "Apportionment Clause; Three-Fifths Clause", text: "Representatives and direct Taxes shall be apportioned among the several States which may be included within this Union, according to their respective Numbers, which shall be determined by adding to the whole Number of free Persons, including those bound to Service for a Term of Years, and excluding Indians not taxed, three fifths of all other Persons. The actual Enumeration shall be made within three Years after the first Meeting of the Congress of the United States, and within every subsequent Term of ten Years, in such Manner as they shall by Law direct. The Number of Representatives shall not exceed one for every thirty Thousand, but each State shall have at Least one Representative; and until such enumeration shall be made, the State of New Hampshire shall be entitled to chuse three, Massachusetts eight, Rhode Island and Providence Plantations one, Connecticut five, New-York six, New Jersey four, Pennsylvania eight, Delaware one, Maryland six, Virginia ten, North Carolina five, South Carolina five, and Georgia three." },
  "ar1s2c4":  { name: "Vacancy Clause (House)", text: "When vacancies happen in the Representation from any State, the Executive Authority thereof shall issue Writs of Election to fill such Vacancies." },
  "ar1s2c5":  { name: "Impeachment Clause (Power to Impeach)", text: "The House of Representatives shall chuse their Speaker and other Officers; and shall have the sole Power of Impeachment." },
  "ar1s3c1":  { name: "Composition Clause (Senate)", text: "The Senate of the United States shall be composed of two Senators from each State, chosen by the Legislature thereof, for six Years; and each Senator shall have one Vote." },
  "ar1s3c2":  { name: "Classification Clause", text: "Immediately after they shall be assembled in Consequence of the first Election, they shall be divided as equally as may be into three Classes. The Seats of the Senators of the first Class shall be vacated at the Expiration of the second Year, of the second Class at the Expiration of the fourth Year, and of the third Class at the Expiration of the sixth Year, so that one third may be chosen every second Year; and if Vacancies happen by Resignation, or otherwise, during the Recess of the Legislature of any State, the Executive thereof may make temporary Appointments until the next Meeting of the Legislature, which shall then fill such Vacancies." },
  "ar1s3c3":  { name: "Qualifications Clause (Senate)", text: "No Person shall be a Senator who shall not have attained to the Age of thirty Years, and been nine Years a Citizen of the United States, and who shall not, when elected, be an Inhabitant of that State for which he shall be chosen." },
  "ar1s3c4":  { name: "Vice President Clause", text: "The Vice President of the United States shall be President of the Senate, but shall have no Vote, unless they be equally divided." },
  "ar1s3c5":  { name: "President Pro Tempore Clause", text: "The Senate shall chuse their other Officers, and also a President pro tempore, in the Absence of the Vice President, or when he shall exercise the Office of President of the United States." },
  "ar1s3c6":  { name: "Impeachment Trial Clause", text: "The Senate shall have the sole Power to try all Impeachments. When sitting for that Purpose, they shall be on Oath or Affirmation. When the President of the United States is tried, the Chief Justice shall preside: And no Person shall be convicted without the Concurrence of two thirds of the Members present." },
  "ar1s3c7":  { name: "Impeachment Clause (Effect of)", text: "Judgment in Cases of Impeachment shall not extend further than to removal from Office, and disqualification to hold and enjoy any Office of honor, Trust or Profit under the United States: but the Party convicted shall nevertheless be liable and subject to Indictment, Trial, Judgment and Punishment, according to Law." },
  "ar1s6c1":  { name: "Speech or Debate Clause", text: "The Senators and Representatives shall receive a Compensation for their Services, to be ascertained by Law, and paid out of the Treasury of the United States. They shall in all Cases, except Treason, Felony and Breach of the Peace, be privileged from Arrest during their Attendance at the Session of their respective Houses, and in going to and returning from the same; and for any Speech or Debate in either House, they shall not be questioned in any other Place." },
  "ar1s6c2":  { name: "Ineligibility Clause; Incompatibility Clause; Emoluments Clause", text: "No Senator or Representative shall, during the Time for which he was elected, be appointed to any civil Office under the Authority of the United States, which shall have been created, or the Emoluments whereof shall have been encreased during such time; and no Person holding any Office under the United States, shall be a Member of either House during his Continuance in Office." },
  "ar1s7c1":  { name: "Origination Clause; Revenue Clause", text: "All Bills for raising Revenue shall originate in the House of Representatives; but the Senate may propose or concur with Amendments as on other Bills." },
  "ar1s7c2":  { name: "Presentment Clause", text: "Every Bill which shall have passed the House of Representatives and the Senate, shall, before it become a Law, be presented to the President of the United States; If he approve he shall sign it, but if not he shall return it, with his Objections to that House in which it shall have originated, who shall enter the Objections at large on their Journal, and proceed to reconsider it. If after such Reconsideration two thirds of that House shall agree to pass the Bill, it shall be sent, together with the Objections, to the other House, by which it shall likewise be reconsidered, and if approved by two thirds of that House, it shall become a Law. But in all such Cases the Votes of both Houses shall be determined by yeas and Nays, and the Names of the Persons voting for and against the Bill shall be entered on the Journal of each House respectively. If any Bill shall not be returned by the President within ten Days (Sundays excepted) after it shall have been presented to him, the Same shall be a Law, in like Manner as if he had signed it, unless the Congress by their Adjournment prevent its Return, in which Case it shall not be a Law." },
  "ar1s7c3":  { name: "Orders, Resolutions, and Votes Clause", text: "Every Order, Resolution, or Vote to which the Concurrence of the Senate and House of Representatives may be necessary (except on a question of Adjournment) shall be presented to the President of the United States; and before the Same shall take Effect, shall be approved by him, or being disapproved by him, shall be repassed by two thirds of the Senate and House of Representatives, according to the Rules and Limitations prescribed in the Case of a Bill." },
  "ar1s8c1":  { name: "Taxing and Spending Clause; General Welfare Clause", text: "The Congress shall have Power To lay and collect Taxes, Duties, Imposts and Excises, to pay the Debts and provide for the common Defence and general Welfare of the United States; but all Duties, Imposts and Excises shall be uniform throughout the United States;" },
  "ar1s8c2":  { name: "Borrowing Clause", text: "To borrow Money on the credit of the United States;" },
  "ar1s8c3":  { name: "Commerce Clause", text: "To regulate Commerce with foreign Nations, and among the several States, and with the Indian Tribes;" },
  "ar1s8c4":  { name: "Naturalization Clause; Bankruptcy Clause", text: "To establish an uniform Rule of Naturalization, and uniform Laws on the subject of Bankruptcies throughout the United States;" },
  "ar1s8c5":  { name: "Weights and Measures Clause", text: "To coin Money, regulate the Value thereof, and of foreign Coin, and fix the Standard of Weights and Measures;" },
  "ar1s8c6":  { name: "Counterfeiting Clause", text: "To provide for the Punishment of counterfeiting the Securities and current Coin of the United States;" },
  "ar1s8c7":  { name: "Postal Clause", text: "To establish Post Offices and post Roads;" },
  "ar1s8c8":  { name: "Copyright Clause; Patent Clause; Intellectual Property Clause", text: "To promote the Progress of Science and useful Arts, by securing for limited Times to Authors and Inventors the exclusive Right to their respective Writings and Discoveries;" },
  "ar1s8c9":  { name: "Inferior Courts Clause", text: "To constitute Tribunals inferior to the supreme Court;" },
  "ar1s8c10": { name: "Piracies and Felonies Clause", text: "To define and punish Piracies and Felonies committed on the high Seas, and Offences against the Law of Nations;" },
  "ar1s8c11": { name: "War Powers Clause; Marque and Reprisal Clause", text: "To declare War, grant Letters of Marque and Reprisal, and make Rules concerning Captures on Land and Water;" },
  "ar1s8c12": { name: "Army Clause", text: "To raise and support Armies, but no Appropriation of Money to that Use shall be for a longer Term than two Years;" },
  "ar1s8c13": { name: "Navy Clause", text: "To provide and maintain a Navy;" },
  "ar1s8c14": { name: "Military Regulations Clause", text: "To make Rules for the Government and Regulation of the land and naval Forces;" },
  "ar1s8c15": { name: "Militias Clause", text: "To provide for calling forth the Militia to execute the Laws of the Union, suppress Insurrections and repel Invasions;" },
  "ar1s8c16": { name: "Organizing Militias Clause", text: "To provide for organizing, arming, and disciplining, the Militia, and for governing such Part of them as may be employed in the Service of the United States, reserving to the States respectively, the Appointment of the Officers, and the Authority of training the Militia according to the discipline prescribed by Congress;" },
  "ar1s8c17": { name: "Enclave Clause; Seat of Government Clause", text: "To exercise exclusive Legislation in all Cases whatsoever, over such District (not exceeding ten Miles square) as may, by Cession of particular States, and the Acceptance of Congress, become the Seat of Government of the United States, and to exercise like Authority over all Places purchased by the Consent of the Legislature of the State in which the Same shall be, for the Erection of Forts, Magazines, Arsenals, dock-Yards, and other needful Buildings;–And" },
  "ar1s8c18": { name: "Necessary and Proper Clause; Elastic Clause", text: "To make all Laws which shall be necessary and proper for carrying into Execution the foregoing Powers, and all other Powers vested by this Constitution in the Government of the United States, or in any Department or Officer thereof." },
  "ar1s9c1":  { name: "1808 Clause; Migration or Importation Clause; Slave Trade Clause", text: "The Migration or Importation of such Persons as any of the States now existing shall think proper to admit, shall not be prohibited by the Congress prior to the Year one thousand eight hundred and eight, but a Tax or duty may be imposed on such Importation, not exceeding ten dollars for each Person." },
  "ar1s9c2":  { name: "Suspension Clause; Habeas Corpus Clause", text: "The Privilege of the Writ of Habeas Corpus shall not be suspended, unless when in Cases of Rebellion or Invasion the public Safety may require it." },
  "ar1s9c3":  { name: "Bill of Attainder Clause; Ex Post Facto Clause (federal)", text: "No Bill of Attainder or ex post facto Law shall be passed." },
  "ar1s9c4":  { name: "Capitation Clause; Direct Tax Clause", text: "No Capitation, or other direct, Tax shall be laid, unless in Proportion to the Census or enumeration herein before directed to be taken." },
  "ar1s9c5":  { name: "Export Clause; Appropriations Clause", text: "No Tax or Duty shall be laid on Articles exported from any State." },
  "ar1s9c6":  { name: "Port Preference Clause", text: "No Preference shall be given by any Regulation of Commerce or Revenue to the Ports of one State over those of another: nor shall Vessels bound to, or from, one State, be obliged to enter, clear, or pay Duties in another." },
  "ar1s9c7":  { name: "Appropriations Clause; Statement and Account Clause", text: "No Money shall be drawn from the Treasury, but in Consequence of Appropriations made by Law; and a regular Statement and Account of the Receipts and Expenditures of all public Money shall be published from time to time." },
  "ar1s9c8":  { name: "Emoluments Clause; Title of Nobility Clause (federal)", text: "No Title of Nobility shall be granted by the United States: And no Person holding any Office of Profit or Trust under them, shall, without the Consent of the Congress, accept of any present, Emolument, Office, or Title, of any kind whatever, from any King, Prince, or foreign State." },
  "ar1s10c1": { name: "Contract Clause; Ex Post Facto Clause (state); Bill of Attainder Clause (state)", text: "No State shall enter into any Treaty, Alliance, or Confederation; grant Letters of Marque and Reprisal; coin Money; emit Bills of Credit; make any Thing but gold and silver Coin a Tender in Payment of Debts; pass any Bill of Attainder, ex post facto Law, or Law impairing the Obligation of Contracts, or grant any Title of Nobility." },
  "ar1s10c2": { name: "Import-Export Clause", text: "No State shall, without the Consent of the Congress, lay any Imposts or Duties on Imports or Exports, except what may be absolutely necessary for executing it's inspection Laws: and the net Produce of all Duties and Imposts, laid by any State on Imports or Exports, shall be for the Use of the Treasury of the United States; and all such Laws shall be subject to the Revision and Controul of the Congress." },
  "ar1s10c3": { name: "Compact Clause; Tonnage Clause", text: "No State shall, without the Consent of Congress, lay any Duty of Tonnage, keep Troops, or Ships of War in time of Peace, enter into any Agreement or Compact with another State, or with a foreign Power, or engage in War, unless actually invaded, or in such imminent Danger as will not admit of delay." },
  "ar2s1c1":  { name: "Executive Vesting Clause", text: "The executive Power shall be vested in a President of the United States of America. He shall hold his Office during the Term of four Years, and, together with the Vice President, chosen for the same Term, be elected, as follows" },
  "ar2s1c5":  { name: "Natural-born Citizen Clause", text: "No Person except a natural born Citizen, or a Citizen of the United States, at the time of the Adoption of this Constitution, shall be eligible to the Office of President; neither shall any Person be eligible to that Office who shall not have attained to the Age of thirty five Years, and been fourteen Years a Resident within the United States." },
  "ar2s2c1":  { name: "Commander in Chief Clause; Pardon Clause", text: "The President shall be Commander in Chief of the Army and Navy of the United States, and of the Militia of the several States, when called into the actual Service of the United States; he may require the Opinion, in writing, of the principal Officer in each of the executive Departments, upon any Subject relating to the Duties of their respective Offices, and he shall have Power to grant Reprieves and Pardons for Offences against the United States, except in Cases of Impeachment." },
  "ar2s2c2":  { name: "Appointments Clause; Advice and Consent Clause; Treaty Clause", text: "He shall have Power, by and with the Advice and Consent of the Senate, to make Treaties, provided two thirds of the Senators present concur; and he shall nominate, and by and with the Advice and Consent of the Senate, shall appoint Ambassadors, other public Ministers and Consuls, Judges of the supreme Court, and all other Officers of the United States, whose Appointments are not herein otherwise provided for, and which shall be established by Law: but the Congress may by Law vest the Appointment of such inferior Officers, as they think proper, in the President alone, in the Courts of Law, or in the Heads of Departments." },
  "ar2s2c3":  { name: "Recess Appointments Clause", text: "The President shall have Power to fill up all Vacancies that may happen during the Recess of the Senate, by granting Commissions which shall expire at the End of their next Session." },
  "ar2s3c1":  { name: "Take Care Clause; Faithful Execution Clause; Reception Clause", text: "He shall from time to time give to the Congress Information of the State of the Union, and recommend to their Consideration such Measures as he shall judge necessary and expedient; he may, on extraordinary Occasions, convene both Houses, or either of them, and in Case of Disagreement between them, with Respect to the Time of Adjournment, he may adjourn them to such Time as he shall think proper; he shall receive Ambassadors and other public Ministers; he shall take Care that the Laws be faithfully executed, and shall Commission all the Officers of the United States." },
  "ar3s1c1":  { name: "Judicial Vesting Clause", text: "The judicial Power of the United States, shall be vested in one supreme Court, and in such inferior Courts as the Congress may from time to time ordain and establish. The Judges, both of the supreme and inferior Courts, shall hold their Offices during good Behaviour, and shall, at stated Times, receive for their Services, a Compensation, which shall not be diminished during their Continuance in Office." },
  "ar3s2c1":  { name: "Case or Controversy Clause", text: "The judicial Power shall extend to all Cases, in Law and Equity, arising under this Constitution, the Laws of the United States, and Treaties made, or which shall be made, under their Authority;—to all Cases affecting Ambassadors, other public Ministers and Consuls;—to all Cases of admiralty and maritime Jurisdiction;—to Controversies to which the United States shall be a Party;—to Controversies between two or more States;—between a State and Citizens of another State,—between Citizens of different States,—between Citizens of the same State claiming Lands under Grants of different States, and between a State, or the Citizens thereof, and foreign States, Citizens or Subjects." },
  "ar3s2c2":  { name: "Exceptions Clause; Appellate Jurisdiction Clause", text: "In all Cases affecting Ambassadors, other public Ministers and Consuls, and those in which a State shall be Party, the supreme Court shall have original Jurisdiction. In all the other Cases before mentioned, the supreme Court shall have appellate Jurisdiction, both as to Law and Fact, with such Exceptions, and under such Regulations as the Congress shall make." },
  "ar3s2c3":  { name: "Jury Trial Clause", text: "The Trial of all Crimes, except in Cases of Impeachment, shall be by Jury; and such Trial shall be held in the State where the said Crimes shall have been committed; but when not committed within any State, the Trial shall be at such Place or Places as the Congress may by Law have directed." },
  "ar4s1c1":  { name: "Full Faith and Credit Clause", text: "Full Faith and Credit shall be given in each State to the public Acts, Records, and judicial Proceedings of every other State. And the Congress may by general Laws prescribe the Manner in which such Acts, Records and Proceedings shall be proved, and the Effect thereof." },
  "ar4s2c1":  { name: "Comity Clause; Privileges and Immunities Clause", text: "The Citizens of each State shall be entitled to all Privileges and Immunities of Citizens in the several States." },
  "ar4s2c2":  { name: "Extradition Clause", text: "A Person charged in any State with Treason, Felony, or other Crime, who shall flee from Justice, and be found in another State, shall on Demand of the executive Authority of the State from which he fled, be delivered up, to be removed to the State having Jurisdiction of the Crime." },
  "ar4s2c3":  { name: "Fugitive Slave Clause", text: "No Person held to Service or Labour in one State, under the Laws thereof, escaping into another, shall, in Consequence of any Law or Regulation therein, be discharged from such Service or Labour, but shall be delivered up on Claim of the Party to whom such Service or Labour may be due." },
  "ar4s3c1":  { name: "Admissions Clause", text: "New States may be admitted by the Congress into this Union; but no new State shall be formed or erected within the Jurisdiction of any other State; nor any State be formed by the Junction of two or more States, or Parts of States, without the Consent of the Legislatures of the States concerned as well as of the Congress." },
  "ar4s3c2":  { name: "Property Clause; Territorial Clause", text: "The Congress shall have Power to dispose of and make all needful Rules and Regulations respecting the Territory or other Property belonging to the United States; and nothing in this Constitution shall be so construed as to Prejudice any Claims of the United States, or of any particular State." },
  "ar4s4c1":  { name: "Guarantee Clause", text: "The United States shall guarantee to every State in this Union a Republican Form of Government, and shall protect each of them against Invasion; and on Application of the Legislature, or of the Executive (when the Legislature cannot be convened) against domestic Violence." },
  "ar6c2":    { name: "Supremacy Clause", text: "This Constitution, and the Laws of the United States which shall be made in Pursuance thereof; and all Treaties made, or which shall be made, under the Authority of the United States, shall be the supreme Law of the Land; and the Judges in every State shall be bound thereby, any Thing in the Constitution or Laws of any State to the Contrary notwithstanding." },
  "ar6c3":    { name: "Loyalty Clause; Oaths Clause", text: "The Senators and Representatives before mentioned, and the Members of the several State Legislatures, and all executive and judicial Officers, both of the United States and of the several States, shall be bound by Oath or Affirmation, to support this Constitution; but no religious Test shall ever be required as a Qualification to any Office or public Trust under the United States." },
};

// Named clause aliases — common names map to a CLAUSES key
const NAMED_CLAUSES = {
  "commerce":            "ar1s8c3",
  "necessary and proper": "ar1s8c18",
  "elastic":             "ar1s8c18",
  "spending":            "ar1s8c1",
  "taxing":              "ar1s8c1",
  "welfare":             "ar1s8c1",
  "origination":         "ar1s7c1",
  "presentment":         "ar1s7c2",
  "speech or debate":    "ar1s6c1",
  "speech and debate":   "ar1s6c1",
  "emoluments":          "ar1s9c8",
  "habeas corpus":       "ar1s9c2",
  "suspension":          "ar1s9c2",
  "appropriations":      "ar1s9c7",
  "export":              "ar1s9c5",
  "contract":            "ar1s10c1",
  "supremacy":           "ar6c2",
  "appointments":        "ar2s2c2",
  "advice and consent":  "ar2s2c2",
  "treaty":              "ar2s2c2",
  "commander in chief":  "ar2s2c1",
  "pardon":              "ar2s2c1",
  "natural born":        "ar2s1c5",
  "natural-born":        "ar2s1c5",
  "take care":           "ar2s3c1",
  "faithful execution":  "ar2s3c1",
  "vesting":             "ar1s1c1",
  "legislative vesting": "ar1s1c1",
  "executive vesting":   "ar2s1c1",
  "judicial vesting":    "ar3s1c1",
  "full faith and credit": "ar4s1c1",
  "privileges and immunities": "ar4s2c1",
  "extradition":         "ar4s2c2",
  "guarantee":           "ar4s4c1",
  "republican":          "ar4s4c1",
  "copyright":           "ar1s8c8",
  "patent":              "ar1s8c8",
  "war powers":          "ar1s8c11",
  "declare war":         "ar1s8c11",
  "enclave":             "ar1s8c17",
  "three-fifths":        "ar1s2c3",
  "three fifths":        "ar1s2c3",
  "apportionment":       "ar1s2c3",
  "due process":         "am5",
  "takings":             "am5",
  "double jeopardy":     "am5",
  "self-incrimination":  "am5",
  "equal protection":    "am14s1",
  "citizenship":         "am14s1",
};

function parseReference(query) {
  const trimmed = query.trim();
  if (trimmed.toLowerCase() === "pre") {
    return { type: "preamble", query: trimmed };
  }

  // Named clause lookup e.g. "commerce", "necessary and proper"
  const namedKey = NAMED_CLAUSES[trimmed.toLowerCase()];
  if (namedKey) {
    return { type: "named", key: namedKey, query: trimmed };
  }

  // Supports ranges: ar1s2-3, am14s1-3, ar1s8c1-3 (spaces optional)
  const match = trimmed.match(/^(ar|am)\s*(\d+)(?:\s*s\s*(\d*)(?:-(\d+))?)?(?:\s*c\s*(\d*)(?:-(\d+))?)?$/i);
  if (!match) {
    return null;
  }

  const source = match[1].toLowerCase();
  const number = Number(match[2]);
  const section = (match[3] !== undefined && match[3] !== '') ? Number(match[3]) : undefined;
  const sectionEnd = (match[4] !== undefined && match[4] !== '') ? Number(match[4]) : undefined;
  const clause = (match[5] !== undefined && match[5] !== '') ? Number(match[5]) : undefined;
  const clauseEnd = (match[6] !== undefined && match[6] !== '') ? Number(match[6]) : undefined;

  if (clause && !section) {
    throw new Error("Clause syntax requires a section, for example: ar1s8c3");
  }
  if (sectionEnd && sectionEnd <= section) {
    throw new Error("Range end must be greater than range start.");
  }
  if (sectionEnd && clause) {
    throw new Error("Clause syntax cannot be combined with a section range.");
  }
  if (clauseEnd && clauseEnd <= clause) {
    throw new Error("Clause range end must be greater than range start.");
  }

  return {
    type: source === "ar" ? "article" : "amendment",
    number,
    section,
    sectionEnd,
    clause,
    clauseEnd,
    query: trimmed
  };
}

function resolveReference(parsed) {
  if (parsed.type === "preamble") {
    return {
      title: "Preamble",
      text: CONSTITUTION.preamble,
      syntax: "pre"
    };
  }

  if (parsed.type === "named") {
    const clause = CLAUSES[parsed.key];
    if (!clause) throw new Error(`Unknown named clause key: ${parsed.key}`);
    return { title: clause.name, text: clause.text, syntax: parsed.query };
  }

  const source = parsed.type === "article" ? CONSTITUTION.articles : CONSTITUTION.amendments;
  const entry = source[parsed.number];
  if (!entry) {
    throw new Error(`Unknown ${parsed.type} number: ${parsed.number}`);
  }

  if (parsed.section) {
    if (!entry.sections) {
      throw new Error(`${formatReference(parsed)} is invalid because this amendment has no numbered sections.`);
    }

    // Section range
    const sectionEnd = parsed.sectionEnd || parsed.section;
    const sectionNums = [];
    for (let s = parsed.section; s <= sectionEnd; s++) sectionNums.push(s);

    if (parsed.clause) {
      // Clause range within a single section — look up from hardcoded CLAUSES map
      const clauseEnd = parsed.clauseEnd || parsed.clause;
      const clauses = [];
      for (let c = parsed.clause; c <= clauseEnd; c++) {
        const key = `${parsed.type === "article" ? "ar" : "am"}${parsed.number}s${parsed.section}c${c}`;
        const clauseEntry = CLAUSES[key];
        if (!clauseEntry) throw new Error(`Clause not found: ${key}. Only named clauses are supported.`);
        clauses.push(clauseEntry.text);
      }
      const clauseKey = (parsed.type === "article" ? "ar" : "am") + parsed.number + "s" + parsed.section + "c" + parsed.clause;
      const clauseName = clauses.length === 1 ? (CLAUSES[clauseKey] && CLAUSES[clauseKey].name || "") : "";
      const title = formatReference(parsed) + (clauseName ? " (" + clauseName + ")" : "");
      return { title, text: clauses.join("\n\n"), syntax: parsed.query };
    }

    const parts = sectionNums.map(sNum => {
      const section = entry.sections[sNum];
      if (!section) throw new Error(`Unknown section ${sNum} in ${formatReference(parsed)}`);
      return sectionNums.length > 1 ? `Section ${sNum}. ${section.text}` : section.text;
    });
    return { title: formatReference(parsed), text: parts.join("\n\n"), syntax: parsed.query };
  }

  if (parsed.clause) {
    throw new Error("Clause syntax requires a section.");
  }

  return {
    title: formatReference(parsed),
    text: entry.text || Object.entries(entry.sections)
      .map(([sectionNumber, sectionValue]) => `Section ${sectionNumber}. ${sectionValue.text}`)
      .join("\n\n"),
    syntax: parsed.query
  };
}

function buildInsertText(reference) {
  return [
    `> [!constitution] ${reference.title}`,
    `> ${reference.text.replace(/\n/g, "\n> ")}`
  ].join("\n");
}

class ConstitutionSuggestion {
  constructor(reference) {
    this.reference = reference;
    this.displayText = reference.title;
    this.preview = reference.text.length > 180 ? `${reference.text.slice(0, 177)}...` : reference.text;
    this.insertText = buildInsertText(reference);
  }

  renderSuggestion(el) {
    const container = el.createDiv({ cls: "constitution-reference-suggestion" });
    container.createDiv({ cls: "constitution-reference-suggestion-title", text: this.displayText });
    container.createDiv({ cls: "constitution-reference-suggestion-preview", text: this.preview });
  }
}

function findActiveReference(lineText) {
  // Requires "==" prefix; captures the == and the reference so both get replaced on insert
  const matches = [...lineText.matchAll(/(?:^|\s)(==(?:pre|[a-z][a-z\s\-]*?|(?:ar|am)\s*\d+(?:\s*s\s*\d*(?:-\d+)?(?:\s*c\s*\d*(?:-\d+)?)?)?)\s?)$/gi)];
  if (matches.length === 0) {
    return null;
  }

  const match = matches[matches.length - 1];
  const full = match[1]; // includes the "=="
  const raw = full.slice(2).trim(); // strip "==" and any trailing space before passing to parseReference
  const index = match.index + match[0].lastIndexOf(full);
  return { raw, index, fullLength: full.length };
}

class ConstitutionEditorSuggest extends EditorSuggest {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  onTrigger(cursor, editor) {
    const line = editor.getLine(cursor.line).substring(0, cursor.ch);
    const active = findActiveReference(line);
    if (!active) {
      return null;
    }

    // Use cursor as both start and end so Obsidian re-queries on every keystroke.
    // The actual replacement range (covering "--...") is stored in the query payload.
    return {
      start: cursor,
      end: cursor,
      query: JSON.stringify({ raw: active.raw, replaceStart: active.index })
    };
  }

  async getSuggestions(context) {
    try {
      const { raw, replaceStart } = JSON.parse(context.query);
      // Only show suggestion if query ends with a digit (ar/am refs) or a letter (named clauses like "commerce").
      // This prevents the popup from stealing keypresses mid-typing.
      if (!/\d$/.test(raw) && !(raw.toLowerCase() in NAMED_CLAUSES)) {
        return [];
      }
      const parsed = parseReference(raw);
      if (!parsed) {
        return [];
      }
      const resolved = resolveReference(parsed);
      const suggestion = new ConstitutionSuggestion(resolved);
      suggestion._replaceStart = replaceStart;
      return [suggestion];
    } catch (error) {
      return [];
    }
  }

  renderSuggestion(suggestion, el) {
    suggestion.renderSuggestion(el);
  }

  selectSuggestion(suggestion) {
    if (this.context) {
      const line = this.context.editor.getCursor().line;
      const start = { line, ch: suggestion._replaceStart };
      const end = this.context.editor.getCursor();
      this.context.editor.replaceRange(suggestion.insertText, start, end);
    }
  }
}

class ConstitutionLookupModal extends SuggestModal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
    this.setPlaceholder("Lookup: ar1s2-3, am14s1, pre, or named clause e.g. commerce");
    this.setInstructions([
      { command: "==ar1s2-3", purpose: "Article section range (inline trigger)" },
      { command: "==am14s1", purpose: "Amendment section (inline trigger)" },
      { command: "==ar1s8c1-3", purpose: "Clause range (inline trigger)" },
      { command: "pre", purpose: "Preamble" }
    ]);
  }

  getSuggestions(query) {
    try {
      const parsed = parseReference(query);
      if (!parsed) {
        return [];
      }
      return [new ConstitutionSuggestion(resolveReference(parsed))];
    } catch (error) {
      return [];
    }
  }

  renderSuggestion(suggestion, el) {
    suggestion.renderSuggestion(el);
  }

  onChooseSuggestion(suggestion) {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      new Notice("Open a markdown note to insert the Constitution reference.");
      return;
    }
    view.editor.replaceSelection(suggestion.insertText);
  }
}

module.exports = class ConstitutionReferencePlugin extends Plugin {
  async onload() {
    this.registerEditorSuggest(new ConstitutionEditorSuggest(this));
    this.lookupModal = new ConstitutionLookupModal(this);

    this.addCommand({
      id: "constitution-reference-lookup",
      name: "Constitution Lookup",
      callback: () => this.lookupModal.open()
    });

    this.addRibbonIcon("scale", "Constitution Lookup", () => {
      this.lookupModal.open();
    });

    window.ConstitutionReferenceAPI = {
      queryReference: (query) => {
        const parsed = parseReference(query);
        if (!parsed) {
          return null;
        }
        return resolveReference(parsed);
      }
    };

    this.register(() => {
      delete window.ConstitutionReferenceAPI;
    });
  }
};
```
# manifest.json
```json
{
  "id": "obsidian-constitution-reference",
  "name": "Constitution Reference",
  "version": "1.3.2",
  "minAppVersion": "0.12.0",
  "description": "Look up and insert U.S. Constitution references in Obsidian using article and amendment shorthand.",
  "author": "PaJoFo",
  "isDesktopOnly": false
}
```
# styles.css
```css
.callout[data-callout='constitution'] {
  --callout-icon: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'><path d='M96 0C60.7 0 32 28.7 32 64v384c0 35.3 28.7 64 64 64h224c17.7 0 32-14.3 32-32V128L224 0H96zm128 34.7L317.3 128H224V34.7zM112 208c0-8.8 7.2-16 16-16h128c8.8 0 16 7.2 16 16s-7.2 16-16 16H128c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16h128c8.8 0 16 7.2 16 16s-7.2 16-16 16H128c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16h96c8.8 0 16 7.2 16 16s-7.2 16-16 16h-96c-8.8 0-16-7.2-16-16z'/></svg>";
}

.constitution-reference-suggestion {
  padding: 0.5rem 0;
}

.constitution-reference-suggestion-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.constitution-reference-suggestion-preview {
  color: var(--text-muted);
  font-size: 0.9em;
}
```