// demoData.ts
import { Metadata, ExtractInfoConfig } from '@/lib/store';

export interface DemoText {
  emoji: string;
  title: string;
  description: string;
  text: string;
  metadata: Metadata;
  thumbnailUrl?: string;
}

export const demoTexts = [

  // Sumerian tablet
  {
    emoji: "𒀭",
    title: "Sumerian Complaint Tablet to Ea-nāṣir",
    description: "Ancient Mesopotamian complaint about poor quality copper, history's first customer service dispute",
    text: `## "Complaint to Ea-nasir." 
### Clay tablet letter, Ur, Mesopotamia, circa 1750 BCE. 
##### *Translated by A. Leo Oppenheim, currently held by the British Museum.*


Tell Ea-nasir: Nanni sends the following message:

When you came, you said to me as follows: "I will give Gimil-Sin (when he comes) fine quality copper ingots." You left then but you did not do what you promised me. You put ingots which were not good before my messenger (Sit-Sin) and said: "If you want to take them, take them; if you do not want to take them, go away!"

What do you take me for, that you treat somebody like me with such contempt? I have sent as messengers gentlemen like ourselves to collect the bag with my money (deposited with you) but you have treated me with contempt by sending them back to me empty-handed several times, and that through enemy territory. Is there anyone among the merchants who trade with Telmun who has treated me in this way? You alone treat my messenger with contempt! On account of that one (trifling) mina of silver which I owe you, you feel free to speak in such a way,
while I have given to the palace on your behalf 1,080 pounds of copper, and Umi-abum has likewise given 1,080 pounds of copper, apart from what we both have had written on a sealed tablet to be kept in the temple of Samas.

How have you treated me for that copper? You have withheld my money bag from me in enemy territory; it is now up to you to restore (my money) to me in full.

Take cognizance that (from now on) I will not accept here any copper from you that is not of fine quality. I shall (from now on) select and take the ingots individually in my own yard, and I shall exercise against you my right of rejection because you have treated me with contempt.`,
    metadata: {
  date: '1750 BCE',
      author: 'Nanni',
      researchGoals: 'Understand why Nanni hated Ea-Nasir.',
      additionalInfo: 'Clay tablet from Ur, sent from one merchant to another.',
      title: 'Complaint to Ea-nasir',
      documentEmoji: '𒀁',
      documentType: 'Tablet',
      genre: 'Business Letter',
      placeOfPublication: 'Ur, Mesopotamia',
      academicSubfield: 'Ancient Near Eastern Studies',
      tags: ['Mesopotamia', 'Business History', 'Commercial Disputes'],
      summary: 'Ancient customer complaint about inferior copper.',
      fullCitation: 'Nanni. "Complaint to Ea-nasir." Clay tablet letter, Ur, Mesopotamia, circa 1750 BCE. Translated by A. Leo Oppenheim.',
       thumbnailUrl: '/demo-thumbnails/nannitablet.jpg'
    }
  },

  // Late medieval theological treatise
{
  emoji: "👹",
  title: "Types of Demons",
  description: "A 1504 Latin text on demons and spiritual temptation",
  text: `Quanto autem inuidiosae et blasphemias bono inspirans quale illud in lib. 4 Reg. xxii. ait:  
Egrediar et ero spiritus mendax in ore omnium prophetarum.  
Praeterea firmissime Cassianus diuitio suis audit de­mones nunquam sursum ascendere.  
Dicit etiam Luciferi, secundum Sanctum Alexium, et Beelzebub dicuntur ad effectum in obsedes fingendi,  
quia eos quod obsidere faciunt mutuos furibundos et eosdem ab hominibus qualificari potuisse.  
Serio autem alij sunt incentores libidinis, vt Asmodeus de quo Tobiae iii.  
et alij uanitatum et insaniae. Dan. vi.  
Et spiritus de cæliby vicio est vt demon superbiæ vocitatur Lucifer et judicis luxuriae.  
Irae Sathanas, Baal zebub sed est de multitudine multitatis.  

Haec de speciebus et de causis status sum dixero, vide ubi Demon generatur.  
De primo alij dicunt demones meridianos alij nocturnos qui alij dicuntur timit.  
Psal.: non timebis a timore nocturno, a sagitta volante in die, a incursu a daemonio meridiano.  
Ubi Lyra dicit Rabbini falso monere quod in deserto haberent ficte ab hebraeis tabernacula in tenebris  
et concubitu vastari a meridie.  

Et quod ipsa sunt nocturna demonium quod permissa est primo propter illa maggia noctidiana  
in tenebris sibi obiecto.  
Altero vero quod conceditur magistra in meridie vel clara die.  
Ait idem Lyra quod videt probabile satis non esse demones angeli  
sed sunt occupandi ad peccatores fidelius et vanos facere tentationes  
quia gaudent diversis temporibus et pro oppositu malitiae certare multipliciter.  

Vti ergo supra excerpta verba Psalmista dixit distingui quinque genera tentationum  
secundum quinque dicta in Psalm.:  
Timor et occultatione significat timorem nocturnum.  
Secunda tenuis et malefica qui per sagittam volat in die.  
Tertium latere occulto designatur per negotiis perambulantem in tenebris.  
Exaudire aperta est demonium meridianum id est Diabolo aperta alicui sunt demonum  
ut dicit Augustinus *De divinatione demonium*.  

Qui corpora humana non sentiendo penetrat et se cogitationibus corporum hominum quantum per arma animae  
quae est imaginatione varia multisfice vigilantis sive dormientis.  
Et ita in virtute imaginationis quae est ab hominibus diabolo permissa imagine principalibus  
ut dicit alias in carnali concupiscentia.  

Jam ergo quod demones nominis istis non est ob demonum.  
Nono alij sunt demones vt dicit Cassianus ubi supradictus.  
Si energumenis non veritas aliqua adeo ut ea quae geruntur vel loquuntur  
neque nos intelligantur aliqua non rationem et postea recordantur.  
Dicunt autem energumeni propter quod demones veraciter vt nisi possint operationes naturales  
exercere per solum libertatis quod obsessis quibus aliquid aboleas externa mania vexantur  
et obsident ad modum castigare videlicet viduare demones nisi secundum reperiuntur  
bonos accipitur indifferenter per altero.  

Vnde in Magistrum in distinctione vii. et secundum diabolo potestates hominum  
aliqui solis corporibus aliis quibus non est diabolicis est autem virtute concedendo molestare.  
Aliqui solum mentalibus per permittitur molesti tale.  
Aliqui utrumque et hoc diabolicum est per aliisque.  

**Quare tentatores demones primitus cade non ostendet cui et maxime eos post secundam ad cunctis manifeste vexantur**;  
unde non sunt. Rhadet firmissime Cassianus in collatione.  
Primo objiciendo quoniam in eis demoniis veraciter debemus credere.  
Secundo quoniam si operationes similis hominis a demonio nullo veritatis vel veras esse  
quia omnia demoni non ab ipsis motu proprio et medico in eis ad voluntario integrum quod est bonum  
sed generaliter regula cenando est.  

Tertio quia certationes debeo bono obsidens et amittere nisi demon sit sua bonitate  
nos nil per voluntarie inertia vappulare sicut beatus Hieronymus vi. vi. vi.  
in plerisque leuissimis eis videtur sicut dolosa et praetexit noscere per aliter purum sunt certe facere.  

Et ipsa bona docmus sui venduntur veraciter regem secundum quod nos demonum malignus est,  
quia non est de industria per voluntatem obediential sed ab aliquo per daemonium vincitur ista.  

4 Regum xxii. Et certissimum est abbas Moyses quibus bonus respondens respondent sancti Macharii  
bonorum coram demonium infestibus mobil pluribus leguntur in vita patrum.  

Secundo obiiciunt quod imperfecte fiducie Cassianus in sententia non sunt despicientes  
sed a demonibus vexantur quia non sunt perfecte spe­mina praecauenda ignorantiose iudicatur.  
Si aliqui ut Augustinus *De Trinitate* libro iii. habent causam.  

Tertium certo puero baptizato et innocentibus ut veraciter a demonio hoc permittitter,  
ut videatur manifestissime miseria hominum vitae quam incurrimus per peccatum primo parentum.  
Et etiam sit fortiter per merita et purgationem propriam ex demonio causis ut patrum vita.  

Quarto quia ad usum ridet firmissime Cassianus dicit quod lucis ista (unde) demonicae artes dicuntur certas  
ipse et Augustinus plenum simulatorem agminium in deo non dat ociositas versantes  
sed ut ipsi faciunt rationes per quam sua sibi laborat ammirentur in pluribus.  

Et enim sui gaudio sunt tristitia quia perfusissim fides sua gaudio dat ut contraria.  
Certum (ut dicit) divinum potentia sua vellicet odiosius demoniaca miseria aspectibus substraxit.  
Primo nec per corporibus corporibus veraciter ita cernore nos intolerabilis timore perterramur maxime  
quia per voluntarie sua ad libitus et transformatum inuit ut tremulis.  

Secundo hoc eis ita odioso videtur faciente quidem incautio illo qui credulus.  
Tertio nec intimi hominibus ad demonica fieret quidem amicicia familiaris  
tam per participationis cuius modo eo voluntarie quod aliqui querunt bonis  
qualia etiam solet fieri inter maleficos congressus.  

**Deus laudabilis etc.**`,
  metadata: {
    date: '1504',
    author: 'Pelbartus de Themeswar',
    researchGoals: 'Investigate late medieval demonology, angelology, and the psychology of temptation in monastic theology',
    additionalInfo: 'Excerpted from Pelbartus’s posthumous theological synthesis published in the early 16th century as part of the Rosarium series.',
    title: 'De Daemonibus et Tentationibus',
    documentEmoji: '👿',
    documentType: 'Book',
    genre: 'Demonology',
    placeOfPublication: 'Hagenau, Holy Roman Empire',
    academicSubfield: 'Theology / Moral Philosophy',
    tags: ['Demonology', 'Cassianus', 'Pelbartus', 'Spiritual Temptation', 'Rosarium', 'Latin Scholasticism'],
    summary: 'Complex Latin theological discourse on the nature, classification, and function of demons.',
    fullCitation: 'Pelbartus de Themeswar. *Secundus Liber Rosarii Theologiae Aurei: ad Sententiarum secundum librum accommodatissimus.* Hagenau: 1504.',
     thumbnailUrl: '/demo-thumbnails/pelbartus.jpg'
  }
},

   // Spanish colonial document
  {
    emoji: "🌵",
    title: "Mexican Inquisition Peyote Ban",
    description: "1620 Spanish colonial edict banning the use of the psychedelic peyote cactus",
    text: `NOS LOS INQVISIDORES CONTRA LA HERETICA PRAVEDAD, Y APOSTASSIA
EN LA Ciudad de Mexico estados, y Prouincias de la Nueua Espafia, nueua Galicia, Guate-
mala, Nicaragua, Yucatan, Verapaz, Honduras, Yslas philipinas, y su distrito, y iurisdicion
por authoridad Appostolica. &c. Por quanto el vso de la Yerba o Raiz llamada Peyote, para
el effecto que en estas Prouincias se ha introducido de descubrir hurtos, y adebinar otros
succesos, y futuros c6tingentes occultos, es accion supersticiosa y reprouada oppuesta A la
purega, y sinceridad de nuestra Santa Fee Catholica, siendo ansi, que la dicha yerba, ni otra
alguna no pueden tener la virtud, y eficacia natural que se dize para los dichos effectos ni
para causar las ymagines, fantasmas y representaciones en que se fundan las dichas adeui-
naciones, y que en ellas se vee notoriamente la sugestion, y asistencia del demonio, autor
deste abuso, valiendose primero para introduzirle de la facilidad natural de los Indios, y de
su inclinacion a la idolatria, y deribondose (sic) despues A otras muchas personas poco temerosas
de Dios, y de fee muy informe, con cuyos excesos ha tomado mas fuerga el dicho vicio, y se
comete con la frequencia que se hecha deuer (sic). Y deui6do Nos por la obligacion de nuestro
cargo atajarle, y occurrir a los dafios, y graues offensas de Dios nuestro Sefior, que del resultan.
Auiendolo tratado, y conferido con personas doctas, y de rectas conciencias, acordamos dar la
presente para vos, y A cada vno de vos, por la qual exortamos, requirimos, y en virtud de santa
obediencia. y sopena de excomunion mayor latae sententiae trina Canonica monitione prae-
missa, y de otras penas pecuniarias, y corporeles (sic) a nuestro arbitrio reseruodas (sic).
Mandamos, que deaque adelante ninguna persona de qualquier grado, y condicion que sea
pueda vsar ni vse de la dicha yerba, del Peyote ni de otras para los dichos effectos, ni para otros
semejantes, debajo de ningun titulo, o color, ni hagan que los indios ni otras personas las
tomen con apercibimiento que lo contrario haciendo, demas deque abreys incurrido en las
dichas Censuras y penas, procederemos contra los q rebeldes e inobediftes fueredes, como c6tra
personas sospechosas en la santa fee Catholica.
Y por quito el dicho delicto ha estado hasta aqui ta introducido, y vsado como se sabe, y
nuestra intencion es prohibirle, y remediarle para adelante, y aquietar las concienias de las
personas que le an cometido queriendo vsar de venignidad, y de la comissi6 que para ello
tenemos del Illustrissimo sefior confesor de su Magestad, Inquisidor General en todos sus
Reynos, y Sefiorios, concedemos gracia, y remission de todo lo passado en el dicho excesso
hasta el dia de la publicacion deste nuestro Edicto, y prohibicion, y cometemos a qualasquiera
(sic) confesores seculares o regulares approbados por sus Ordinarios, licencia, y facultad para
absoluer del dicho delicto A los que como dicho es le vuieren cometido hasta aqui. Con tal que
la dicha absolucion no se estienda ' lo venidero ni A otros delictos, excesos hechicerias, y super-
sticiones de las contenidas en el Edicto general de la fee, y en los demas que en esta ragon hemos
mandado publicar los quales han de quedar en su fuerga, y obseruancia, y porque lo contenido
en esta carta venga A noticia de todos, y nadie lo pueda ygnorar, mandamos que se publeque
(sic) en todas la Ciudades Villas, y lugares de nuestro distrito. Dada en la Sala de nuestra
Audiencia A diez y nueue dias del mes de Iunio de mill y seiscientos y veinte afi`,
    metadata: {
       date: 'June 29, 1620',
      author: 'Don Pedro Nabarre de Isla',
      researchGoals: 'Investigate Spanish colonial attitudes toward indigenous spiritual practices.',
      additionalInfo: 'Document from the Spanish Inquisition in colonial Mexico banning the use of peyote.',
      title: 'Edict Prohibiting the Use of Peyote',
      documentEmoji: '🌵',
      documentType: 'Legal Edict',
      genre: 'Inquisition Document',
      placeOfPublication: 'Mexico City, New Spain',
      academicSubfield: 'Colonial Latin American History',
      tags: ['Spanish Inquisition', 'Indigenous Practices', 'Colonial Control'],
      summary: 'Official ban on use of the psychedelic cactus in New Spain.',
      fullCitation: 'Nabarre de Isla, Don Pedro. "Edict Prohibiting the Use of Peyote." Mexico City: Holy Office of the Inquisition, June 29, 1620.',
       thumbnailUrl: '/demo-thumbnails/inquisition.jpg'
    }
  },

// 17th century economic theory
  {
    emoji: "⚜️",
    title: "17th Century Economics",
    description: "Thomas Mun's influential economic treatise on trade, wealth, and national prosperity",
    text: `**The Means to enrich this Kingdom, and to encrease our Treasure.**

Although a Kingdom may be enriched by gifts received, or by purchase taken from some other Nations, yet these are things uncertain and of small consideration when they happen. Forraign Trade is the Rule of our Treasure.The ordinary means therefore to encrease our wealth and treasure is by Forraign Trade, wherein wee must ever observe this rule; to sell more to strangers yearly than wee consume of theirs in value. For suppose that when this Kingdom is pletifully served with the Cloth, Lead, Tinn, Iron, Fish and other native commodities, we doe yearly export the overplus to forraign Countries to the value of twenty two hundred thousand pounds; by which means we are enabled beyond the Seas to buy and bring in forraign wares for our use and Consumption, to the value of twenty hundred thousand pounds; By this order duly kept in our trading, we may rest assured that this order duly kept in our trading, we may rest assured that the Kingdom shall be enriched yearly two hundred thousand pounds, which must be brought to us in so much Treasure; because that part of our stock which is not returned to us in wares must necessarily be brought home in treasure.

For in this case it cometh to pass in the stock of a Kingdom, as in the estate of a private man; who is supposed to have one thousand pounds yearly revenue and two thousand pounds of ready money in his Chest: If such a man through excess shall spend one thousand five hundred pounds per annum, all his ready mony will be gone in four years; and in the like time his said money will be doubled if he take a Frugal course to spend but five hundred pounds per annum; which rule never faileth likewise in the Common-wealth, but in some cases (of no great moment) which I will hereafter declare, when I shall shew by whom and in what manner this ballance of the Kingdoms account ought to be drawn up yearly, or so often as it shall please the State to discover how much we gain or lose by trade with forraign Nations. But first I will say something concerning those ways and means which will encrease our exportations and diminish our importations of wares; which being done, I will then set down some other arguments both affirmative and negative to strengthen that which is here declared, and thereby to shew that all the other means which are commonly supposed to enrich the Kingdom with Treasure are altogether insufficient and meer fallacies.


Chap. III.

The particular ways and means to encrease the exportation of our commodities, and to decrease our Consumption of forraign wares.



The revenue or stock of a Kingdom by which it is provided of forraign wares is either Natural or Artificial. The Natural wealth is so much only as can be spared from our own use and necessities to be exported unto strangers. The Artificial consists in our manufactures and industrious trading with forraign commodities, concerning which I will set down such particulars as may serve for the cause we have in hand.

1. First, although this Realm be already exceeding rich by nature, yet might it be much encreased by laying the waste grounds (which are infinite) into such employments as should no way hinder the present revenues of other manufactured lands, but hereby to supply our selves and prevent the importations of Hemp, Flax, Cordage, Tobacco, and divers other things which now we fetch from strangers to our great impoverishing.

2. We may likewise diminish our importations, if we would soberly refrain from excessive consumption of forraign wares in our diet and rayment, with such often change of fashions as is used, so much the more to encrease the waste and charge; which vices at this present are more notorious amongst us than in former ages. Yet might they easily be amended by enforcing the observation of such good laws as are strictly practised in other Countries against the said excesses; where likewise by commanding their own manufactures to be used, they prevent the coming in of others, without prohibition, or offence to strangers in their mutual commerce.

3. In our exportations we must not only regard our own superfluities, but also we must consider our neighbours necessities, that so upon the wares which they cannot want, nor yet be furnished thereof elsewhere, we may (besides the vent of the Materials) gain so much of the manufacture as we can, and also endeavour to sell them dear, so far forth as the high price cause not a less vent in the quantity. But the superfluity of our commodities which strangers use, and may also have the same from other Nations, or may abate their vent by the use of some such like wares from other places, and with little inconvenience; we must in this case strive to sell as cheap as possible we can, rather than to lose the utterance of such wares. For we have found of late years by good experience, that being able to sell our Cloth cheap in Turkey, we have greatly encreased the vent thereof, and the Venetians have lost as much in the utterance of theirs in those Countreys, because it is dearer. And on the other side a few years past, when by excessive price of Wools our Cloth was exceeding dear, we lost at the least half our clothing for forraign parts, which since is no otherwise (well neer) recovered again than by the great fall of price for Wools and Cloth.The State in some occasions may gain most, when private men by their revenues get least. We find that twenty five in the hundred less in the price of these and some other Wares, to the loss of private mens revenues, may raise above fifty upon the hundred in the quantity vented to the benefit of the publique. For when Cloth is dear, other Nations doe presently practise clothing, and we know they want neither art nor materials to this performance. But when by cheapness we drive them from this employment, and so in time obtain our dear price again, then do they also use their former remedy. So that by these alterations we learn, that it is in vain to expect a greater revenue of our wares than their condition will afford, but rather it concerns us to apply our endeavours to the times with care and diligence to help our selves the best we may, by making our cloth and other manufactures without deceit, which will encrease their estimation and use.

4. The value of our exportations likewise may be much advanced when we perform it our selves in our own Ships, for then we get only not the price of our wares as they are worth here, but also the Merchants gains, the changes of ensurance, and fraight to carry them beyond the seas. As for example, if the Italian Merchants should come hither in their own shipping to fetch our Corn, our red Herrings or the like, in the case the Kingdom should have ordinarily but 25. s. for a quarter of Wheat, and 20. s. for a barrel of red herrings, whereas if we carry these wares our selves into Italy upon the said rates, it is likely that wee shall obtain fifty shillings for the first, and forty shillings for the last, which is a great difference in the utterance or vent of the Kingdoms stock. And although it is true that the commerce ought to be free to strangers to bring in and carry out at their pleasure, yet nevertheless in many places the exportation of victuals and munition are either prohibited, or at least limited to be done onely by the people and Shipping of those places where they abound.

5. The frugal expending likewise of our own natural wealth might advance much yearly to be exported unto strangers; and if in our rayment we will be prodigal, yet let this be done with our own materials and manufactures, as Cloth, Lace, Imbroderies, Cutworks and the like, where the excess of the rich may be the employment of the poor, whose labours notwithstanding of this kind, would be more profitable for the Commonwealth, if they were done to the use of strangers.

6. The Fishing in his Majesties seas of England, Scotland and Ireland is our natural wealth, and would cost nothing but labour, which the Dutch bestow willingly, and thereby draw yearly a very great profit to themselves by serving many places of Christendom with our Fish, for which they return and supply their wants both of forraign Wares and Mony, besides the multitude of Mariners and Shipping, which hereby are maintain'd, whereof a long discourse might be made to shew the particular manage of this important business. Our Fishing plantation likewise in New-England, Virginia, Groenland, the Summer Islands and the New-found-land, are of the like nature, affording much wealth and employments to maintain a great number of poor, and to encrease our decaying trade.

**How some States have been made Rich.**

7. A Staple or Magazin for forraign Corn, Indico, Spices, Raw-silks, Cotton wool or any other commodity whatsoever, to be imported will encrease Shipping, Trade, Treasure, and the Kings customes, by exporting them again where need shall require, which course of Trading, hath been the chief means to raise Venice, Genoa, the low-Countreys, with some others; and for such a purpose England stands most commodiously, wanting nothing to this performance but our own diligence and endeavour.

8. Also wee ought to esteem and cherish those trades which we have in remote or far Countreys, for besides the encrease of Shipping and Mariners thereby,The traffick in the East Indies is our most profitable trade in its proportion both for King and Kingdom. the wares also sent thither and receiv'd from thence are far more profitable unto the kingdom than by our trades neer at hand; As for example; suppose Pepper to be worth here two Shillings the pound constantly, if then it be brought from the Dutch at Amsterdam, the Merchant may give there twenty pence the pound, and gain well by the bargain, but if he fetch this Pepper from the East-indies, he must not give above three pence the pound at the most, which is a mighty advantage, not only in that part which serveth for our own use, but also for that great quantity which (from hence) we transport yearly unto divers other Nations to be sold at a higher price: whereby it is plain,We get more by the Indian wares than the Indians themselves. that we make a far greater stock by gain upon these Indian Commodities, than those Nations doe where they grow, and to whom they properly appertain, being the natural wealth of their Countries. But for the better understanding of this particular, we must ever distinguish between the gain of the Kingdom, and the profit of the Merchant; for although the Kingdom payeth no more for this Pepper than is before supposed, nor for any other commodity bought in forraign parts more than the stranger receiveth from us for the same,yet the Merchant payeth not only that price,A distinction between the Kingdoms gain and the Merchants profit. but also the fraight, ensurance, customes and other charges which are exceeding great in these long voyages; but yet all these in the Kingdoms accompt are but commutations among our selves, and no Privation of the Kingdoms stock, which being duly considered, together with the support also of our other trades in our best Shipping to Italy, France, Turkey, and East Countreys and other places, by transporting and venting the wares which we bring yearly from the East Indies; It may well stir up our utmost endeavours to maintain and enlarge this great and noble business, so much importing the Publique wealth, Strength, and Happiness. Neither is there less honour and judgment by growing rich (in this manner) upon the stock of other Nations, than by an industrious encrease of our own means, especially when this later is advanced by the benefit of the former, as we have found in the East Indies by sale of much of our Tin, Cloth, Lead and other Commodities, the vent whereof doth daily encrease in those Countreys which formerly had no use of our wares.

9. It would be very beneficial to export money as well as wares, being done in trade only, it would encrease our Treasure; but of this I write more largely in the next Chapter to prove it plainly.

10. It were policie and profit for the State to suffer manufactures made of forraign Materials to be exported custome-free, as Velvets and all other wrought Silks, Fustians, thrown Silks and the like, it would employ very many poor people, and much encrease the value of our stock yearly issued into other Countreys, and it would (for this purpose) cause themore foraign Materials to be brought in, to the improvement of His Majesties Customes. I will here remember a notable increase in our manufacture of winding and twisting only of forraign raw Silk, which within 35. years to my knowledge did not employ more than 300. people in the City and suburbs of London, where at this present time it doth set on work above fourteen thousand souls, as upon diligent enquiry hath been credibly reported unto His Majesties Commissioners for Trade. and it is certain, that if the raid forraign Commodities might be exported from hence, free of custome, this manufacture would yet encrease very much, and decrease as fast in Italy and in the Netherlands. But if any man allege the Dutch proverb, Live and let others live; I answer, that the Dutchmen notwithstanding their own Proverb, doe not onely in these Kingdoms, encroach upon our livings, but also in other forraign parts of our trade (where they have power) they do hinder and destroy us in our lawful course of living, hereby taking the bread out of our mouth, which we shall never prevent by plucking the pot from their nose, as of late years too many of us do practise to the great hurt and dishonour of this famous Nation; We ought rather to imitate former times in taking sober and worthy courses more pleasing to God and suitable to our ancient reputation.

11. It is needful also not to charge the native commodities with too great customes, lest by indearing them to the strangers use, it hinder their vent. And especially forraign wares brought in to be transported again should be favoured, for otherwise that manner of trading (so much importing the good of the Commonwealth) cannot prosper nor subsist. But the Consumption of such forraign wares in the Realm may be the more charged, which will turn to the profit of the kingdom in the Ballance of the Trade, and thereby also enable the King to lay up the more Treasure out of his yearly incomes, as of this particular I intend to write more fully in his proper place, where I shall shew how much money a Prince may conveniently lay up without the hurt of his subjects.

12. Lastly, in all things we must endeavour to make the most we can of our own, whether it be Natural or Artificial; And forasmuch as the people which live by the Arts are far more in number than they who are masters of the fruits, we ought the more carefully to maintain those endeavours of the multitude, in whom doth consist the greatest strength and riches both of the King and Kingdom: for where the people are many, and the arts good, there the traffique must be great, and the Countrey rich. The Italians employ a greater number of people, and get more money by their industry and manufactures of the raw Silks of the Kingdom of Cicilia, than the King of Spain and his Subjects have by the revenue of this rich commodity. But what need we fetch the example so far, when we know that our own natural wares doe not yield us so much profit as our industry? For Iron oar in the Mines is of no great worth, when it is compared with the employment and advantage it yields being digged, tried, transported, brought, sold, cast into Ordnance, Muskets, and many other instruments of war for offence and defence, wrought into Anchors, bolts, spikes, nayles and the like, for the use of Ships, Houses, Carts, Coaches, Ploughs, and other instruments for Tillage. Compare our Fleece-wools with our Cloth, which requires shearing, washing, carding, spinning, Weaving, fulling, dying, dressing and other trimmings, and we shall find these Arts more profitable than the natural wealth, whereof I might instance other examples, but I will not be more tedious, for if I would amplify upon this and the other particulars before written, I might find matter sufficient to make a large volume, but my desire in all is only to prove what I propound with brevity and plainness.
`,
    metadata: {
        date: '1664',
      author: 'Thomas Mun',
      researchGoals: 'Understand how the 17th century economic policies of Thomas Mun have resonance for the present day and for understanding early modern history.',
      additionalInfo: 'This is an excerpt from the book Englands treasure by forraign trade by Thomas Mun, a leading economic writer of 17th century England.',
      title: 'England\'s Treasure by Forraign Trade',
      documentEmoji: '👑',
      documentType: 'Book',
      genre: 'Economic Treatise',
      placeOfPublication: 'London, England',
      academicSubfield: 'Economic History',
      tags: ['Mercantilism', 'Early Modern Economics', 'Trade Policy'],
      summary: 'Early mercantilist tract on foreign trade balance.',
      fullCitation: 'Mun, Thomas. England\'s Treasure by Forraign Trade. London: Thomas Clark, 1664.',
      thumbnailUrl: '/demo-thumbnails/munbook.jpg'
    }
  },

  {
  emoji: "🍵",
  title: "An 18th century drug guide",
  description: "A Portuguese apothecary's guide to exotic drugs",
  text: `# MEMORIAL DE VARIOS SIMPLICES

Que da India Oriental, da America, & de outras par-
tes do mundo vem ao nosso Reyno para reme-
dio de muytas doenças, no qual se acharão as virtudes de cada hum, & o modo com
que se devem usar.

A India, & de outras partes da Europa vem para este Reyno muytos remedios de singulares virtudes, conteudas, & annexas a differentes pedras, raizes, páos, seméntes, & frutos; mas porq́ nem das doenças para que os taes remedios servem, nem do modo com que se devem applicar, haja algum roteyro impresso que o ensine; daqui procede, que tendo muytas pessoas em suas casas os ditos remedios, & padecendo varias enfermidades, que facil-mente se podião curar com elles, por falta de noticia dos pres-timos que tem os ditos remedios ficão sem utilidade algũa, & os doentes sem saude: esta consideração, & sentimento incitou a minha curiosidade, & o zelo do bem commum, para que a cus-to de grandes diligencias buscasse não só a algumas pessoas, que assistírão na India, & ou-
tras terras do mundo; mas descobrisse varios papeis manuscritos, para que informando me de huns, & outros, soubesse com fundamento as virtudes das sobreditas pedras, páos, rai-zes, & frutos, & fizesse este Memorial em soccorro da natureza humana; se por este servi-ço que faço ao bem publico não merecer agradecimento, não merecerey reprehensão, & se ma derem, acabarey de entender que ha homens tam ingratos, & de animo tam deprava-do, que fazem por malicia, o que os meninos fazem por innocencia, mamão o leyte, & mordem o peyto.

Os remedios que vem da India Oriental, & de outras partes, ou sejão pedras, páos, ossos, frutos, sementes, ou raizes, se dão moidos, ou roçados em agua commua; outros os dão misturados em agua de arroz, a que os naturaes daquellas terras chamão Ambatacanja; al-guns os dão em çumo de limão gallego; & aquelles que se dão para as febres, se bebem à en-trada, & à despedida dellas.

A experiencia dos Mouros, & Gentios da Asia, foy a mestra, que deo o conhecimento para o uso dos taes remedios. Tambem a experiencia de alguns curiosos tem mostrado os grandes proveytos, que muytas vezes resultão das suas operações, não encontrando as ge-raes evacuações da Medicina, de que os Panditos, que assistem naquellas terras, tambem usão desde o principio das enfermidades com qualquer descarga precedente, não dilatando tempo em os applicar, & nesta fórma curão as mais agudas, & malignas doenças, regulan-do o tempo da sangria, purga, ajuda, ou vomitorio para o tempo do cordeal, de maneyra que se não applique tudo no mesmo instante, nem se encontre hum remedio com outro, an-tes faça cada hum o seu effeyto livremente.

Muytos Medicos, & outras pessoas que o não são, tem para si que os bezoarticos, & re-medios que vem da India, & de outras terras, nam fazem em Portugal as mesmas maravi-lhas, que fazem na India, & nas terras em que se criárão, assim pela differença do clima, co-mo porque quando chegão cà, jà não tem aquelle vigor, que tinhão nas terras em que nas-cerão. A esta duvida respondo, que todos os simplices conservão as virtudes, com que Deos os creou, em quanto no corpo dos taes simplices nam entra corrupção. Vemos, & experimentamos, que dos simplices, que vem das Conquistas para as boticas do nosso Rey-no, se fazem muytos remedios compostos, & tornão para as mesmes Conquistas para servi-ço dos enfermos, & là fazem os mesmos bons effeytos, que fizerão em Portugal, vindo de diversos climas, & sendo muytos simplices das boticas, mais sugeytos à corrupçaó, que nenhum dos bezoarticos da India, que tem duração muyto mais larga, & perduravel.

Nem falta homem curioso, que poderà mostrar muytos remedios, que vierão da India ha mais de trinta annos, que estão hoje com as mesmas virtudes, com que vierão daquelle Estado, & fazem os mesmos bons effeytos em Portugal, que fazião na India.

Isto supposto como verdade experimentada, iremos tratando de cada hum dos simpli-ces com relação individual de suas virtudes, começando pela pedra Bazar, que he a mais conhecida, & usada, assim em Portugal, como em todo o mundo.



## PEDRA BAZAR SIMPLEZ.

**Regimento, & virtudes da Pedra Bazar Simplez, ou natural, que nas-ce nos buxos de huns animaes, muy semelhantes aos cabritinhos.**

He necessario examinar com grande cuydado se a pedra Bazar he ver-dadeyra, ou falsa, porque, se he verdadeyra, obra excellentes effeytos, com tal con-dição, que se deve dar em quantidade de vinte & quatro grãos de cada vez, porque dando somente tres, ou quatro grãos, como costumão dar os barbeyros, que saõ os Medicos da gente ordinaria, nenhum effeyto faz, pela pouca quantidade em que a dão, & deste modo ficão o remedio infamado, a vida do doente perdida, & o dinheyro malgastado; & não suc-cederia assim, se a pedra fosse verdadeyra, & a dessem na quantidade sobredita.

He necessario que os Medicos principiantes advirtão duas cousas muyto importantes. A primeyra, que a dita pedra se deve misturar com cinco, ou seis onças de agua commua cozida com escorcioneyra, ou com papoulas, ou com cardo santo, porque os que dão a dita pedra misturada com aguas destilladas, errão no alvo em claro, pelas razões que os curiosos pódem ver na minha Palyanthea da segunda impressão trat. 2. cap. 128. fol 770. & seq.

A segunda cousa, que devem advertir os que derem a dita pedra, he, que a misturem com cinco, ou seis onças de agua commua cozida com qualquer das cousas sobreditas, por-que os que a dão misturada com duas colheres de agua, como fazem os barbeyros, tambem erram no alvo, porque tam pouca quantidade de agua nam he vehiculo bastante para levar a pedra aos lugares distantes aonde ha de servir; mas misturando se com grande quantidade de agua, faz muyto bons effeytos nas ancias do coração, nos vágados, nas faltas de respira-ção, & em todas as febres agudas, & malignas, dando a a qualquer hora que a necessidade o pedir, & sobre sangrias.

Nas suppressões altas da ourina tem a pedra Bazar, sendo verdadeyra, grande virtude, com tal condiçaõ, que antes de a applicar, façam tomar ao doente hum vomitorio de tres onças de agua Benedicta, ou de seis grãos de Tartaro emetico, ou de meya oytava de ca-parrosa branca, sangrando-o ao outro dia nos braços quatro vezes, no outro dia tres, & ao outro outras tres, porque como este caso he tam perigoso, & apressado, he necessario faze-rem se os remedios com grande brevidade, porque se nam ourinão até o septimo dia, ordi-nariamente morrem; & por esta razão requeyro da parte de Deos aos Medicos principian-tes, que comecem infallivelmente a cura das suppressões, sejam altas, ou bayxas, por vo-mitorios, & sangrias repetidas nos braços; porque este conselho se funda na experiencia de 50. annos, & nas muytas suppressiões que curey felizmente por este estylo, como os curiosos pódem ver na minha Polyanthea da segunda impressão trat. 2. cap. 81. fol. 509. a num. 36. usq. ad 40. aonde acharão nomeados os doentes que curey de suppressões altas por este estylo estando alguns delles jà ungidos quando me charmarão.

Permitta se me haver feyto esta digressão, porque me obriga o zelo da vida dos proxi-mos, a dar este aviso tam importante aos presentes, & futuros Medicos.

Tornando ao proposito da pedra Bazar, digo, que depois de dados os vomitorios, & san-grias altas, que são remedios precisamente necessarios, se darà a tal pedra em quantidade de 24. grãos misturados com oyto onças de agua quente, que primeyro seja cozida com huma onça de páo de faveyra seca, & em falta delle, có meya onça de eroca marinha, & em falta della com duas oytavas da erva sapinha, & melhor que tudo, com meya onça de erva chamada virga aurea. Finalmente serve a pedra Bazar, applicada na dita quantidade, para facilitar a camara aos dureyros, com tal condiçaõ que o doente a tome seis dias successivos estando em jejum, misturada com hũa oytava de cremores de Tartaro verdadeyros, desa-tando tudo em hum quartilho de agua cozida com borragens, ou ameyxas. Digo, cremo-res de tartaro verdadeyros, porque hoje vem de fóra do Reyno muytos falsificados com pedra hume, & em lugar de facilitarem a camara, a impedirão. Os que porèm quizerem li-vrarsede este escrupulo, tomem, em lugar dos cremores de tartaro, huma oytava de farro de vinho branco feyto em pó subtilissimo, & experimentaràó grande facilidade na camara.



## PEDRA CORDEAL COMPOSTA.

**Regimento, & virtudes das pedras Cordeaes compostas.**

Estas pedras não saõ creadas pela natureza nas entranhas de alguns animaes; mas saõ compostas por artificio; constão de varios ingredientes, todos escolhidos, & dotados de grandes virtudes cardiacas, & bezoarticas; daqui procede, que o artifice, que faz estas pedras compostas, he hum Religioso da Companhia de JESUS, morador na India, que as fórma mayores, ou menores, conforme as quer fazer: estas taes pedras sendo feytas pelas mãos deste Religioso, tem virtudes singulares para curar as enfermidades seguintes.

Nas febres malignas, & ardentes, quando o enfermo estiver com grandes ancias, se lhe darão 24. grãos pulverizados com seis onças de agua commua cozida com escorcioneyra, ou com papoulas, ou com cereijas negras, porque tomando a nesta quantidade mitiga a quentura, & a secura, q́ a febre causa, & faz q́ a malignidade naõ commetta o coraçaó, an-tes o defende, conforta, & alegra: & se o doente, ou pela grande fraqueza, ou pela muyta velhice appetecer vinho, se lhe darão os 24. grãos da dita pedra desfeytos em duas colhe-res de vinho generoso: nem pareça aos Medicos novatos q́ he erro, ou temeridade dar esta pedra em vinho, porque gravissimos Authores o permittem, quando a fraqueza he muyto grande, por ser o vinho generoso promptissimo remedio em reparar as forças, & alentar o coração, quando està muyto desfalecido.

A qualquer tempo que a melancolia apertar com os doentes, ou com os sãos, tenhão fe-bre, ou a não tenhão, se póde dar a pedra na quantidade sobredita, se não ouver febre, em vinho excellente; & se a ouver, em agua cozida com escorcioneyra, ou com borragens.

Tomada a dita pedra em agua cozida com huma oytava de raiz de contrayerva, ou de serpentaria virginiana, ou em falta destas raizes, cozida com cardo santo, he remedio effi-caz contra todo o genero de peçonha, assim bebida, como procedida de mordedura de vi-bora, de lacràos, de aranha, ou de outros animaes venenosos; & se applicarà a dita pedra sobre a mordedura.

Tomada em vinho em jejum, preserva das doenças, que procederem do ar corrupto.

Cura por modo de milagre aos leprosos, (não estando ainda confirmados) com tanto que se tome dous meses successivos em jejum, misturando 24. grãos della com outros 24. de antimonio diaphoretico calcinado quatro vezes, & reverberado duas horas com fogo fortissimo, dando tudo em meyo quartilho de agua commua levemente cozida com flor da arvore buxo, por ser a dita flor muyto purificativa do sangue salgado, & dos soros morda-zes, & corrosivos.

Para as pessoas muyto esquentadas do figado se tomaõ 24. grãos da dita pedra, por tem-po de dous meses, em jejum, em meyo quartilho de agua cozida com a raiz da brassica ma-rina, ou do vimal, porque qualquer destas ervas tem efficacissima virtude para temperar a quentura do figado, & entranhas.

Tomada a dita pedra, por 40. dias em jejum, em meyo quartilho de agua cozida com huma mão chea de folhas de espinheyro alvar, a que chamamos Rhamno, & com limadu-ras de osso de veado, mata infallivelmente as lombrigas, & cura as comichões, & costras, ou bostelas do corpo.

Tomando por seis dias continuos em jejum 24. grãos do pó desta pedra em quatro onças de vinho do Rhim, ou branco, em que ouvesse estado de infusaõ hũa oytava de pó da raiz da butua, ou de páo da faveyra seca, ou da erva chamada sapinho, ourinarà o doente, & se livrarà da suppressão da ourina, por mais que seja rebelde, com tanto que tenha tomado no primeyro dia hum vomitorio de seis grãos de Tartaro emetico, ou de tres onças de a-gua Benedicta, & seis sangrias nos braços por dous dias successivos.

Confesso ingenuamente, que depois que (por imercè de Deos, & boa fortuna dos doentes) inventey o meu Bezoartico chamado Curviano contra as febres malignas, bexi-gas, & doenças venenosas, não usey mais de pedra Bazar, porque supposto tenho muyto bom conceyto della, sendo verdadeyra, offerecem se me algumas duvidas, & razões muy forçosas para a não usar, porque vejo que da India vem cada anno arrobas, & arrobas del-las; & he moralmente impossivel que tanta quantidade de pedras sejão verdadeyras; & a-lèm desta razão, me consta de pessoas fidedignas, que estiverão na India muytos annos, que nem todos os animaes, em que as taes pedras se crião, as tem, & quando algum tem duas, he hũ milagre: logo razão tenho para não usar dellas, salvo me constar certamente que são verdadeyras.

E no que pertence às pedras cordeaes compostas, se me offerece outra grande, & muy justificada desconfiança para não usar dellas, & he, que os mesmos Religiosos da Compa-nhia de JESUS, que em Goa as fazem verdadeyras, & merecedoras de toda a estimação, se queyxão que là se falsificão, & se espalhão por todo o mundo com o decoroso nome de se-rem feytas pelos mesmos Padres: & prouvera a Deos que só là ouvesse taes falsificadores; mas tambem em Lisboa ha quem falsifica as taes pedras, & as faz taõ parecidas, & seme-lhantes com as verdadeyras, que não se conhece o engano, & falsidade dellas, senão depois que se partem algumas, & se acha que saõ feytas de barro de que se faz a louça branca, a que chamão greda: à vista pois destes enganos, & falsidades razão tenho para não usar das pe-dras cordeaes compostas, salvo me constar certamente que são feytas pelos Padres da Com-panhia de Goa, aonde só se fazem verdadeyras, por ser segredo que foy do Padre Gaspar Antonio, & por sua morte passou ao Padre Jorge Ungarete, & hoje passou a outro Religio-so, Boticarios todos da mesma Companhia, & grandes artifices na Arte Pharmaceutica.

Por me tirar pois destas duvidas, & embaraços da minha consciencia, uso sempre nas fe-bres malignas, & nas bexigas, & aonde vejo ancias do coração, do meu Bezoartico, de cujas virtudes, & maravilhosos proveytos estou certo, não só pelo que tenho visto, & ex-perimentado no discurso de 50. annos; mas pelas noticias que de todo o Reyno, & suas conquistas me tem vindo por cartas gratulatorias, que tenho guardadas para mostrar aos que duvidarem da minha verdade.

Os que com o meu Bezoartico quizerem fazer curas, que pareçãomilagrosas, devem advertir tres cousas muyto necessarias. A primeyra, que o Bezoartico seja verdadeyra-mente meu, & naõ falsificado, como hoje se vende muyto nesta Corte, & em todo o Rey-no, & suas conquistas de bayxo do meu nome, sem lhes fazer escrupulo enganar aos do-entes em materia taõ importante como he a saude, vendendo hum remedio falsificado com o nome de verdadeyro, fazendo deste modo dous furtos, hum do dinheyro que devem restituir, & outro das vidas que não tem restituição. A segunda, que o tal Bezoartico, se se der em pó, se dè em quantidade de meya oytava para cada vez; & se se der misturado com o cozimento de escorcioneyra, & pevides de cidra, (como eu o dou) se deytem tres oyta-vas delle em cada meya canada do tal cozimento, & de 8. em 8. horas se de ao doente hu-ma chicara de seis onças, porque os que derem menos quantidade, ou o derem huma só vez no dia, como alguns o daõ, naõ farão grandes curas; he necessario continuallo todos os dias duas, ou tres vezes, em quanto o doente tiver ancias, ou symptomas malignos. A ter-ceyra, que se applique, tanto que o Medico vir algum sinal da febre ser perniciosa, & ma-ligna, sem esperar que os doentes estejão agonizando, como muytos fazem; donde se segué dous grandes damnos: o primeyro he, morrerem os doentes, porque lhes acudirão tarde com o remedio, que lhes poderia salvar a vida, se fosse applicado a tempo: o segundo he, infamar o remedio, & ficarem os parentes dos mortos atemorizados para o nao quererem tomarem em outras occasiões, por mais perigosos que se vejão.



## Pedra de Porco Espim natural, & suas virtudes.

A Pedra de Porco Espim verdadeyra, he hum dos melhores antidotos, que vem da In-dia para remedio da saude, como se deyxa ver assim pelos bons effeytos que faz, como pelo muyto dinheyro que val, porque qualquer pedra do tamanho de huma azeytona pe-quena, custa ao menos cem milreis.

Entre as virtudes que a dita pedra tem, a principal he, ser grande antidoto das febres malignas, de sorte que depois do meu Bezoartico Curviano, de nenhum outro remedio tenho visto tanta utilidade como da tal pedra. O sinal de ella ser bem fina, & verdadeyra he, que metendo a em agua hum quarto de hora, a faz amargosissima, & tanto mais amar-gosa a fizer, tanto mostra que he mais fina, & excellente. A quantidade que se dà da tal agua, são tres, ou quatro colheres para cada vez, advertindo que a tal agua se deve dar pu-ra, sem se misturar em outra agua, como erradamente fazem alguns barbeyros, & a gente rude, dando por razão que he quente, & que para lhe moderar a quentura, & o amargor, a destemperão com outra agua; & não advertem estes pobres homens, cegos na luz do meyo dia, que ao passo que lhe abatem o grande amargor, lhe enfraquecem, & tirão a vir-tude; & que quando os doentes podião salvar a vida, & vencer a febre, se tomassem a dita a-gua pura, & com toda a sua virtude, & amargor, se achão enganados, & presos com os grilhões da morte. Naõ faço estas advertencias para os Medicos doutos, & experimétados, faço-a para os principiantes, & para os Cirurgiões, que curão em terras aonde não ha Me-dico, & para as pessoas leygas, & ignorantes da Medicina, porque estas como conhecem as cousas superficialmente, & só pela casca, cuydão que se derem a dita agua pura, & com todo o seu amargor, que matarão aos doentes, ou lhes augmentaràó a febre, & por esta ra-zão a destemperão, & lhe tirão a virtude, do mesmo modo que a tirarião, os que tirassem o amargor à quina quina: & agora saberáő a razão porque são taõ prohibidos os doces, & os azedos aos que tomão quina quina, ou agua de Inglaterra; porque como a virtude da quina quina consiste no amargor, quem lho tirar, ou rebater com muyta quantidade de do-ce, ou de azedo, a deytou a perder. Disse, muyta quantidade de doce, ou de azedo; porque se o doce for tam pouco como huma azeytona, ou como huma avelãa, nenhum damno faz, porque para o fazer era necessario que o doce, ou azedo fossem tantos que rebatessem, ou a-pagassem o amargor da quina quina; mas como sendo o doce pouco o naõ rebate, naõ póde fazer damno, como me consta por mil experiencias; porque os permitto àquelles doentes, que estaõ costumados a nao beber agua sem doce. Vejão os curiosos a minha Polyanthea da segunda impressão sobre este ponto tract. 2. fol. 627. num. 23.

Nem só he este o erro que fazem os que destemperam a agua de Porco Espim, para lhe ti-rar o amargor, & quentura; outro commettem muyto peyor, & he, que levados do rustico medo, de que a agua de Porco Espim he quente, não se atrevem a dar mais que huma co-lher della para cada vez, sem advertirem que tam pouca quantidade he pequeno remedio para vencer huma doença taõ venenosa, como he huma febre maligna: eu nunca dou me-nos de quatro colheres para cada vez; & tive alguns doentes, para quem fuy chamado es-tando ungidos, & agonizando por causa de febres malignas, a quem dey tres onças da dita agua, & com ella os livrey da morte.

Hum caso destes observey em casa de Manoel de Castro Guimarães, Escrivaõ do De-sembargo do Paço. Outro caso succedeo com Dona Antonia Mauricia, Religiosa de San-ta Clara, para quem fuy chamado estando com o scirro na garganta, & com o officio da a-gonia rezado, & dando lhe por meu conselho quatro colheres de agua de Porco Espim, misturada com cinco onças do meu Bezoartico, escapou da morte, & vive hoje por mercè de Deos, & beneficio deste remedio. Naõ refiro outros muytos casos felizmente succedi-dos com a agua de Porco Espim dada em mayor quantidade, & misturada com o meu Be-zoartico, por não enfadar aos Leytores; portanto digo, que nas febres malignas, & ancias do coração se devem dar ao menos tres colheres de cada vez, sem ser destemperada.

Nos soluços, ou sejão procedidos da febre ser maligna, ou de ventosidades, obra a dita agua effeytos maravilhosos, de que pudera allegar innumeraveis exemplos, senão temera enfadar.

Nos accidentes uterinos he a agua de Porco Espim remedio tão efficaz, que parece di-vino, como me consta por alguns casos, a que me achey presente, em os quaes dey tres on-ças da dita agua, & obrou effeytos maravilhosos.

Nas dores de colica, a que os Naturaes da India chamão Mordexim, obra tambem a dita agua presentaneos proveytos.

Nas dores, & pontadas causadas de frios se tomão duas onças de agua de macella, em que a pedra de Porco Espim estivesse de infusaõ seis Ave Marias, & obra por modo de encanta-mento.

Finalmente se a Medicina tem espadas de mais de marca, que sejão capazes de resistir, contender, & vencer as febres malignas, são só a pedra de Porco Espim, & o meu Bezoar-tico Curviano, porque de todos os mais remedios, de que o povo faz grande estimaçaó, faço eu tão pouco caso, como da lama da rua. Isto diz hum Medico, que sobre 50. annos de experiencia, & 79. de idade, tem livrado da morte com estes dous remedios a infinitos doentes, que por causa de febres malignas, & de veneno que lhes derão para os matar, es-tavão expirando, como os curiosos pódem ver na minha Polyanthea da segunda impressao de fol. 654. até 662. aonde acharão nomeadas as pessoas, que tirey da sepultura com os di-tos remedios, & pódem ser testemunhas desta verdade.



## Dente de Porco Espim, & suas virtudes.

Roçado o dente de Porco Espim em pedra de sular, ou feyto em pó subtilissimo, tem grande virtude contra as febres, contra as dores de colica, & dores de pedra; he grande contraveneno, & faz grande proveyto nas dores, & torceduras da barriga.

## Pedra de Cananor, & suas virtudes.

A pedra de Cananor ou he verde como limos do rio, ou amarella como enxofre; ambas saõ boas, & de ambas usão os Medicos; mas a verde se estima mais. De qualquer des-tas pedras moidas, ou suladas muyto subtilmente, se faz com agua da fonte huma agua chamada de Cananor, ou de pedra fria: desta agua se usa geralmente em todas as febres, & he muyto bom cordeal; mas serà muyto mais singular, se a agua, em que a tal pedra se pre-parar, for primeyro ferrada com ouro virgem, & deste modo usando se della por algumas manhas em jejum, he excellente para os doentes esquentados do figado, & para os que pa-decem amargores de boca, os quaes ordinariamente procedem de grandissima quentura das entranhas, & do figado, ou de comerem muyta quantidade de doces, porque se con-vertem em colera.

Tambem se usa della para a inflammação dos olhos, sem ser ferrada, & para a inflamma-ção da garganta, & boca, gargarejando com ella; desta agua se costuma dar meyo quarti-lho para cada vez, & se póde repetir duas vezes no dia, ou na declinaçaõ da febre, ou algu-mas horas antes de entrar; refresca muyto, & adoça a acrimonia dos humores, por certa virtude occulta absorbente, abranda os incendios do figado, & entranhas naturaes, com manifesto alivio dos enfermos.

Se as amendoadas, q́ se dão aos que não pódem dormir por causa do grande incendio das febres, ou pelos vapores, que havião de conciliar o somno, subirem muyto quéntes ao cere-bro, se fizerem na dita agua de Cananor, terão os que assim as tomarem, conhecido alivio.

He maravilhosa para curar as ictericias, tomada nove dias em jejum, & misturada com a agua que deytar de si huma clara de ovo fresco bem batido.

## Pedra Candar, & suas virtudes.

A Pedra Candar, chamada vulgarmente pedra Quadrada, porque verdadeyramente o he, tem o feytio de hum dado, & tem cor de ferro, & he muyto pesada; trazem a dos confins da Tartarea aos Jogues, os quaes dizem que tem muytas virtudes, & por esta razão a furão, & pendurão ao pescoço cahidas sobre os peytos, chegada à carne.

Serve esta pedra, atada ao musculo da perna esquerda, para facilitar o parto, estando a mulher em termos de parir, porque a experiencia tem mostrado, que applicada neste esta-do obra o que se deseja. E no caso que esta diligencia não baste, esfregaràó a dita pedra, meyo quarto de hora, com huma onça de oleo de gergelim quente, & o darão a beber á mulher, & logo parirà, & deytarà as pareas, & a criança sem risco, nem perigo da mây; ad-vertindo, que tanto que a mulher parir, & deytar a criança, & as pareas, se tire logo logo a dita pedra, porque se a deyxarem ficar atada muyto tempo, sahirà a madre fóra do seu lugar, & as entranhas todas, como eu vi, & observey em huma mulher na rua das Ga-veas, à qual estando muyto apertada sem poder parir, se applicou a dita pedra, & porque se -descuydarão de a tirar tanto que pario, sahio a madre fóra do seu lugar, & foy necessario applicalla em sima, para que a madre se recolhesse.

E porque algumas mulheres saõ melindrosas, & inimigas de tomar remedios pela boca, -bastarà que com o oleo de gergelim, em que se esfregou a dita pedra hum quarto de ho-ra, lhe esfreguem todo o ventre, & o embigo à roda, com a mesma condição, que tanto que a mulher parir, se alimpe muyto bem o azeyte.

Serve a agua da sua infusaõ, ou em que estiver raspada qualquer migalha da dita pedra, bebida por tempo de hum mes, para curar os fluxos de sangue das almorreymas, por mais copiosos, & teymosos que sejão, com duas condições: a primeyra, que o doente nem beba vinho, nem coma iguarias adubadas com especiarias quentes: a segunda, que a agua em que se fizer a infusaõ, seja primeyro cozida com huma mão chea de erva poligano, chamada dos Herbolarios erva andorinha.

He excellente para curar as vertigens, & desmayos, com tal condição, que se deyte de infusaõ por tempo de duas horas, ou se esfregue tempo de vinte Ave Marias em tres onças de agua de cereijas negras, ou em agua ordinaria, em que primeyro se cozesse levemente meya oytava de mangerona. Quem tomar este remedio por 20. dias successivos, conhece-rà grande alivio. He boa para a melancolia, deytada de infusaõ em agua de borragens, ou de erva cidreyra.

Para as dores de cabeça se bebem alguns dias em jejum duas onças de agua de cardo san-to, em que a dita pedra estivesse duas horas de infusaõ.

Nas pontadas, nas colicas, nas dores de ventre, & nos Pleurizes, tem a dita pedra pro-digiosa vintude, se deytada de infusaõ, ou roçada em quatro onças de agua destillada das cabeças de macella, a derem a beber aos que tiverem qualquer queyxa destas. Nem faça medo aos Medicos medrosos o ser a agua da macella quente, para deyxarem de a applicar; porque Eustachio Rudio, que foy Lente de prima em Padua, & Galeno, que foy Oraculo da Medicina, louvão por soberano remedio para os Pleurizes, & inflammações internas a tal agua, ainda sem ser ajudada da virtude da pedra Candar; quanto melhor serà acompa-nhada com ella? Galeno lib. 3. simplic. medicam. 30. & Eustachio lib. 1. cap. 45. de Pleuritide, mihi fol. 173.

Nas dores de pedra, & difficuldades de ourinar, obra effeytos admiraveis com tal condição, que o doente tenha tomado primeyro hum vomitorio de agua Benedicta, ou de Tartaro emetico, & algumas sangrias nos braços; & feyta esta preparação, se roçarà a pedra por hum quarto de hora em quatro onças de vinho do Rhim, se o ouver, & em sua falta, em vinho branco, ajuntando a este vinho huma onça de çumo de limão a-zedo; & se o doente não quizer tomar o remedio em vinho, o tome em agua commua, em que se tenha cozido meya oytava da raiz da butua, ou da semente da bardana, ou da esteva.

Atando esta pedra sobre o embigo, faz recolher as tripas aos quebrados, sem embargo de que eu ensino outro remedio muyto mais experimentado para recolher as tripas, que se acharà no livro das minhas Observações Latinas, & Portuguezas, na Obs. 41. pag. 252. & 253.

Para os que tem o sangue pizado, ou coalhado por causa de alguma queda ou pancada, o adelgaça outra vez, & o faz capaz para que se continue a circulação, principalmente se a tal pedra for roçada em seis onças de agua cozida com duas oytavas de raizes de vinoeto-xico, ou com folhas de cerfolio, a que ajuntem hum escropulo de spermaceti.

Quem beber por seis meses flor de agua levemente cozida com huma mão chea de verbasco, na qual agua, depois de coada roçarem a pedra Candar, experimentarà maravi-lhosos effeytos nos bocios, & alporcas.

Tem a dita pedra grande dominio sobre a melancolia, roçando a em agua de borragens.

Para os que ourinão sangue, se dão cinco onças de agua de tanchagem, em que se roçou esta pedra.

Para a asthma, roçada em agua de bosta de boy destillada em Mayo, he grande remedio.



## Pedra da cabeça da Cobra de Pate, a que vulgarmente chamão de Mombaça. Virtudes que tem, & como se applica.

Esta pedra he gerada na cabeça das cobras, que se crião nos bosques da Ilha de Pate; tem muytas virtudes; mas a que excede a todas, he em facilitar o parto, atando a ao musculo da perna esquerda, quando a mulher estiver apertada, em termos de parir, porque certamemte parirà logo; mas he necessario advertir, que tanto que a mulher deytar a crian-ça, & as pareas, se tire logo logo a pedra, porque de outra sorte sahirà a Madre fóra de seu lugar.

Moida muyto subtilmente, & dando deste pó o peso de 20. grãos de trigo em tres on-ças de vinho branco, ou em seis onças de agua cozida com altavaca de cobra, ou com meya oytava da semente das carapetas da esteva, mitiga muyto as dores de pedra, & a faz lançar.

Nas suppressões altas da ourina tem muyta virtude, com tal condição que antes de a darem, tome o doente logo logo no primeyro dia da suppressaõ hum vomitorio de tres onças de agua Benedicta, ou dous escropulos de vitriolo branco formado em pilulas; ou seis grãos de Tartaro emetico.

Serve para as dores de colica, & para toda a sorte de febre, & para toda a mordedura de bichos peçonhentos, assim tomada por dentro, como applicado o pó della sobre a morde-dura.

Serve tomada em vinho, ou em agua cozida com semente de bisnaga, para os acciden-tes uterinos. E finalmente serve contra toda a peçonha, ou veneno, que por erro, ou ma-licia se deo pela boca; & tem as mesmas virtudes, que se attribuem à pedra Bazar verda-deyra.

Cayetano de Mello de Castro, que foy Viso-Rey da India, tem a tal pedra, que he re-donda, & cheya de escamas como casca de pinha. Certifica o dito Senhor Viso-Rey, que para facilitar o parto, tem presentanea virtude, como lhe consta por mil experiencias.

## Pedra de Cobra de Dio, & suas virtudes.

Estas pedras não saõ naturaes, são artificiaes, & huma familia unica de Gentios daquel-la Cidade tem o segredo, & faz toda a quatidade dellas, que se espalhão pelo mundo.

A principal virtude destas pedras he contra as mordeduras dos bichos peçonhentos; posta sobre a mordedura com advertencia, que se não tiver sangue, se farà na mesma mor-dedura com o bico de hum alfeneyte, para pegar a pedra, a qual se deyxa estar pegada até cahir por si, depois se deyta em leyte, ou agua rosada, & se limparà, ou enxugarà muy-to bem, & se ha de repetir a postura em quanto pegar, & tanto que não pegar, està acaba-da a cura, & he sinal infallivel de ter jà tirado todo o veneno.

Tambem serve, feyta em pó, & bebida, para a dor de colica; & posta nas bexigas tam-bem as obriga a sahir, ou inchar com presteza. Nem falta Author grave que nas febres ma-lignas, em que ouver pintas, as manda picar, & por sobre a picada as ditas pedras, pela gran-de virtude que tem de chamar para fóra o veneno, & malignidade.

Desta pedra tenho visto maravilhosos effeytos posta sobre as mordeduras de aranhas, ou de quaesquer bichos venenosos, porque chupa, & attrahe para si todo o veneno; & he cousa digna de admiração ver como desfaz as inchações procedidas das mordeduras veneno-sas, por mais grandes, & disformes que sejão, sem que haja descarga alguma, nem despejo manifesto por sangrias, camaras, vomitos, suor, nem ourina, por onde a inchação se des-fizesse. He porèm de advertir, que tanto que a dita pedra cahir, se deyte logo logo em hum pouco de leyte de mulher, ou qualquer outro, porque não se deytando, fica o veneno den-tro na tal pedra, & rebenta feyta em pedaços.

A hum criado do Doutor Francisco Roballo Freyre, segando erva para dar ao seu ma-cho, o mordeo hum bicho de tão venenosa qualidade, que em menos de huma hora lhe in-chou o braço tão disformemente, que foy necessario rasgar lhe a manga do gibão para lho despirem, & estando o pobre lacayo com insoportaveis ancias, & desmayos, se lhe appli-cou a dita pedra, & brevemente desinchou, & ficou saõ. A huma filha de hum livreyro, morador na rua Nova, a mordeo huma aranha emo rosto, & inchou de tal sorte que ningue a conhecia, & tendo noticia que eu tinha esta pedra, ma pedio, & pondo lha desinchou, & sarou em breves horas. O mesmo effeyto desta pedra tenho visto em varias mordeduras de aranhas.

## Pedra Pauzari, & suas virtudes.

Estas pedras vem de Babylonia onde se crião, & saõ raras. Pauzari quer dizer, lisa; a cor he de azeytona d'Elvas, & o feytio, mas he mayor.

Posta sobre os rins tem virtude efficacissima para quebrar a pedra, & tirar a dor em bre-ves horas; para a suppressaõ bayxa, posta sobre a bexiga, He muyto estimada de todos os Principes da Asia.


## Caranguejo de Aynão, & suas virtudes.

Tem tal qualidade o lodo, ou baza do mar das terras de Aynão da Provincia da Chi-na em que està Macão, que o caranguejo que se mete naquelle lodo, se conver-te totalmente em huma dura pedra, & se enchem, & unem todas as partes delle, como se fosse huma cousa lavrada, & engastada pela natureza; o que succede em muy breve espa-ço, porque os que se metem nesta baza, ou lodo, logo ficão immoveis; o que se vè com os olhos, em quanto a marè vaza.

O mate, ou baza desta praya de Aynão tem as mesmas virtudes que o caranguejo; po-rèm nem toda a praya faz esta conversaõ de caranguejo em pedra, senão huma parte desta Ilha, que he a em que viveo São Francisco Xavier.

Moida esta pedra com vinagre, & applicando-a muytas vezes no dia, desfaz todo o ge-nero de inchações, & carnosidades duras, & hernias carnosas.

Huma oytava de peso deste caranguejo feyto em pó subtilissimo, & misturado com seis onças de agua, tomada duas vezes cada dia, cura por modo de milagre as camaras de san-gue, & os puxos, repetindo este remedio cinco ou seis dias.

Huma oytava deste caranguejo de Aynão, feyto em pó, & misturado com agua rosada, & çumo de limão gallego, serve para todo o genero de febres com abafamentos.

A mesma quantidade tomada em bom vinho, serve para as camaras soltas.

A mesma quantidade botada em agua destillada de cereijas negras, ou em agua cozida com raizes de valeriana agreste, tem grandissima virtude para curar os accidentes de gotta coral, continuando se muytos dias, depois do doente bem purgado.

Moida em agua cura a esquinancia, untando a garganta com ella por fóra, & gargare-jando muytas vezes com a tal agua.

Moida a tal pedra com vinagre, & untando o antraz, ou apostema, faz matavilhoso ef-feyto.

Moida em agua se dà a todo o genero de febres, no principio, & declinaçaõ dellas, com taõ bom effeyto, & melhor que o da pedra Bazar.

Moida com bom vinho serve para colicas, & mordexins, nas quaes doenças obra ma-ravilhas.

Moida com agua rosada, ou ordinaria, lançando-a nos olhos dolorosos, & inflammados, os cura maravilhosamente.

Os Naturaes daquella Ilha, onde se achão as pedras dos caranguejos de Aynão, se curão com ellas em todo o genero de achaques; & os mesmos effeytos fazem em todas as mais partes, como a experiencia tem mostrado.

## Dente de peyxe mulher virgem, & suas virtudes.

Serve para estancar os fluxos de sangue da boca, postos sobre o peyto; & para estancar os fluxos bayxos, posta pela parte bayxa.

Serve trazido atado no braço esquerdo chegado à carne, cóntra o ar, accidétes, & vágados.

## Costella de peyxe mulher virgem, & suas virtudes.

Serve, preparada em agua, & bebida, para febres, & para as dores de Pleurizes, pon-tadas, & estupores; advertindo que naõ sendo virgem, naõ tem virtude.

## Priapo, ou genital do cavallo marinho, & suas virtudes.

Dando a beber meya oytava do pó do priapo do cavallo marinho misturado com seis onças de agua commũa cozida com hum páo de faveyra seca, ou com duas oytavas de raiz de Eroca Marinha, ou com cascas de rabãos, provoca muyto a ourina supprimida, com duas condições: primeyra, que o doente tenha tomado primeyro que tudo hum vo-mitorio de seis grãos de Tartaro emetico, ou de duas onças de agua Benedicta, sangran-do se ao outro dia quatro vezes nos braços, & ao outro dia tres, & observando estes con-selhos certamente ourinarà muyto.

He remedio estupendo para os pleurizes, & camaras de sangue, como se tem sabido por innumeraveis experiencias, com tal condição que se darà meya oytava do dito pó mistu-rado para os Pleurizes em agua cozida com flores de papoulas, & para camaras em agua co-zida com alquitira, repetindo se este remedio tres vezes cada dia.


## Dente de cavallo marinho, & suas virtudes.

O Pó subtilissimo deste dente tem grande virtude para as suppressões da ourina, com tal condição que se darà para cada vez huma oytava delle misturado com meyo quartilho de agua cozida com raiz de espargo, ou com raiz de rilha boy, chamada dos la-tinos Ononis, ou Remora aratri, ou com páo de virga aurea: aproveyta muyto para as fe-bres da dita na mesma quantidade misturado na agua das tisanas; trazido junto da carne, tem çerta qualidade occulta contra o ar.

## Dente de dentro da boca do Elefante, & suas virtudes.

Serve para toda a especie de febre, para as dores de costado, & para as dores de rheuma-tismo, & preparando-o tambem em fórma que se cubra com a massa, ou polme do dén-te preparado em agua, & se for rosada, serà melhor, mas deve ser morna.

## Unha do grão besta, & suas virtudes.

A Grão besta he hum animal, que na lingua dos Ethiopes Mouros se chama Nhumbo, & na lingua Portugueza val o mesmo que animal fermoso. A sua fórma he de hum perfeyto cavallo em tudo menos: a sua cauda tem muy pouco pelo, & o casco he fene-dido como unha de cabra; ordinariamente naquelles contornos saõ manchados como Ti-gres; alguns, que saõ raros, de cor castanho claro.

Só as unhas do pé esquerdo saõ as que tem virtude; as outras, sendo do mesmo animal, não tem serventia; & muytas vezes se dà qualquer das ditas unhas, ou vende, & sendo de mesmo animal naõ tem prestimo; & tem a circunstancia de que ha de ser tirada a unha sem ser metida no fogo, nem em agua quente, porque perde a virtude.

O animal he sugeyto a accidentes repetidos, & tem tal instincto, que assim como se vè ameaçado do accidente, mete a unha do pé esquerdo no ouvido, & assim lhe passa logo a força delle.

Serve a unha do grão besta, trazendo a junto à carne no musculo do braço esquerdo, ou ao pescoço, & ainda sobre o peyto, ou no dedo da mão esquerda, engastoada em ouro, de sorte que a unha toque na carne; serve contra os accidentes de gotta coral, & vágados, & contra o ar. Preparada em agua, & bebida serve contra o veneno, & contra as febres inter-mittentes.

Nos accidentes de asthma se darà hum escropulo de pó da dita unha misturado com hu-ma chicara de agua de cereijas negras, por quanto a asthma he hũ accidente de gotta coral do bofe, como diz Vanhelmoncio: Asthma est caducum pulmonis.

## Ossos do espinhaço da Cobra Zuchi, ou Zuichi, & suas virtudes.

Em Angola se crião humas cobras, a que os naturaes chamão Zuichi, que quer dizer melancolia, ou sejão porque a fazem fugir, ou seja como as vezes acontece, que quando se vè perseguida dos que a querem matar, esguicha da boca hũ cuspinho tão delgado, & taõ alvo, que em qualquer parte que cahe a faz logo muyto branca, & para deytar o tal cuspinho ergue o collo, & enche o papo, & deyta o cuspinho direyto aos olhos de quem a persegue, & se lhe não acodem logo com leyte, penetra o seu veneno pelos olhos de sorte, que os cega, & muytas vezes os mata.

Sem embargo porèm da dita cobra ter esta maldade, poz lhe Deos nos ossos do seu espi-nhaço huma grande virtude, que secão, & curão as alporcas, com tal condição, que o do-ente os traga ao pescoço junto da carne por tempo de hum anno.

Para se tirarem estes ossos, depois de îmortaa cobra, se enterra, & como passão quinze dias apodrece a carne, & com facilidade se despegão, & se limpão muyto bem de alguma carne, se lhe ficou pegada, & se guardão; & quando quizerem applicallos a algum doente desta enfermidade, ou q́ tenhão dores de garganta, se infião em hum fio de retroz, & se pen-durão ao pescoço a modo de huma gargantilha. Muytas saõ as pessoas que tem visto, & ex-perimentado a grande virtude destes ossos para as sobreditas enfermidades.



## Dentes de Engala, & suas virtudes.

Em Angola se crião huns animaes da corpulencia de hű porco, na boca destes se achão dous dentes fortes à maneyra de dentes de porco javali; saõ do comprimento de hum palmo, pouco mais, ou menos; o pó destes dentes tem grandissima virtude para rebater as febres malignas, & naõ falta quem diga, que he melhor que a pedra Bazar verdadeyra: faz madurar, & abrir os apostemas, & leicensos, applicando-o sobre elles em fórma de polme tres, ou quatro vezes cada dia: ajuda muyto a sahirem as bexigas, & os sarampãos: constão de muyto sal volatil, & por isso nos Pleurizes faz tão bons effeytos como o dente de porco montez, com tal condiçaõ, que se dè de cada vez meya oytava do seu pó subtilissimo mistu-rado com huma onça de lambedor de papoulas morno, bebendo lhe em sima meyo quarti-lho de agua cozida cõ flores de papoulas, & com cascas de raiz de Bardana. Posso assegurar com a experiencia de 51. annos, que nos Pleurizes he grande remedio, com tal condição, que se applique duas, ou tres vezes cada dia até que o doente acabe de sarar. No meu Pe-culio revelo hum grande remedio para Pleurizes, no capitulo, Pleurizes.

## Raiz da Manica, & suas virtudes.

Esta raiz he de grandissima estimação, assim por ser criada entre o ouro no Reyno da Manica, donde tomou o nome, como tambem por suas admiraveis virtudes.

Serve esta raiz para febres, dar ido te bem moida em quantidade de hum escropulo, mis-turada com seis onças de tisana: dà-se no principio do trio, do mesmo modo que se dà a a-gua de Inglaterra; & se a febre entrar sem frio, se darà do mesmo modo no fim da febre, pa-ra fazer suar!

He admiravel contraveneno, porque o rebate efficazmente.

Serve para toda a sorte de fraqueza do estomago, para conservar o comer nelle, de sorte que se naõ vomite.

Serve para despazer as ventosidades procedidas de causa fria.

Serve para quem tem fastio, tomada duas horas antes de comer, porque conforta o esto-mago, excita a vontade de comer, & he grande remedio para impedir os vomitos.

Serve para feridas frescas, moida com agua, de modo que fique como polme, applican-do-o cada 24. horas, enchendo o vãoda ferida com elle, & brevemente ficarà o doente saõ.

Serve para chagas podres moida do mesmo modo, & applicada à chaga em lugar de un-guento; & isto se farà huma vez cada dia, & sararà em breve tempo, sem necessitarde ou-tra cura, ou remedio humano.

Tambem a dita Manica he hum remedio, ou antidoto muy efficaz contra herpes, mo-endo-se, & pondo-se os pós sobre a ferida, & applicando-se tambem da parte de sima, para que os herpes naõ subão, nem vão por diante.

Serve para dor de colica, chamada nas terras da India, xeringosa, roçada em pedra com çumo de limão, & lançada por ajuda.

He grande contrapeçonha, moida subtilissimamente, & dada a beber com çumo de li-mão gallego.

Serve para mal de Loanda, moida, & dada com agua; & untando com aquelle polme as gengivas muytas vezes no dia, sararão enfermo maravilhosamente.

Serve da mesma forte moida, & applicado o dito polme na face, & na cova do dente que doer, porque tira de todo a dor delle.

Serve para dor de ouvidos, moendo-a com agua, & aquentada em huma colher de pra-ta, & lançando tres, ou quatro gottas no ouvido saõ primeyro, & depois no que tiver a dor.

Pessoas fidedignas que estiverão na India, affirmão que o pó desta raiz subtilissima-mente pulverizado, & misturado com o que for necessario de agua rosada, para fazer hum polme, borrando a testa, & fontes da cabeça com elle, abranda muyto as ditas dores.

Serve para estancar os fluxos de sangue, ou seja tomada pela boca misturada em agua de tanchagem, ou seja deytada por ajuda.

Pessoa ouve taõ confiada, que se atreveo a dizer que o pó subtilissimo desta raiz, toma-do muytos dias em jejum com xarope de hera terrestre, ou de ungula caballina, curava certaméte as chagas do bofe; eu lhe naõ dou inteyro credito; mas em doença, em que a cer-teza da morte (por causa da chaga do bofe) he infallivel, naõ duvidaria eu de fazer o reme-dio, porque se lhe não aproveytar, não farà damno.

Para as feridas frescas com sangue, enchendo o vãoda ferida com o pó fino desta raiz, & curando-as abertas, obra taõ maravilhosamente como o oleo de ouro.

Finalmente he a raiz da Manica remedio supremo para rebater todo o genero de vene-no; advertindo que se tenha grande cuydado, & cautela, que quem tomar esta raiz, não toque qualquer genero de oleo, ou azeyte, porque infallivelmente se converterà em vene-no presentaneo.


## Raiz da Madre de Deos, & suas virtudes.

O pó desta raiz misturados com quatro onças de agua cozida com o páo da faveyra seca, ou com hum molho de folhas de cerfelio, provoca a ourina suppri-mida. Serve o pó desta raiz para todo o genero de febre, principalmente para as que entra-rem com frio, dando se duas vezes cada dia: para grandes dores de cabeça se applica o pol-me desta raiz feyto com çumo de limão gallego nas capelladas dos olhos, & nas fontes: serve esta raiz para inflammações do bofe, como he a Peripneumonia; contra quaesquer outras inflammações interiores: he esta raiz muyto cordeal, & resiste ao veneno das fe-bres malignas, & às mordeduras das cobras venenosas.

## Raiz do Cypò, & suas virtudes.

Esta raiz, a quem os Portuguezes chamão Cypò, chama o Gentio da America Pica-quanha, que he o mesmo, que dizer Pica de cão: ha duas sortes de Cypò, hum he mais grossio, mais branco, & mais forte, outro he mais delgado, mais escuro, & mais be-nigno no obrar: ambas estas raizes tem virtude tão maravilhosa para curar camaras de san-gue, que rarissimas vezes faltão com o effeyto desejado; advertindo, que as taes raizes tem virtude de provocar vomito, a branca o provoca com mais violencia, o remedio para que o não provoquem, he deytallas 24. horas de infusao em vinagre forte; a quantidade que se dà de pó de qualquer destas raizes, he de dous escropulos até huma oytava, toma-se em caldo de galinha, & se repete quatro, ou seis dias.

## Raiz de Solor, & suas virtudes.

Esta raiz com as outras sobreditas, tambem he de singular estimação; usa-se della para toda a especie de febres, & pontadas, & para o veneno, & para dores Nephriticas.

Tambem serve, tomando bochechas, para alimpar a lingua grossa, & para abrir a vontade de comer, quando o enfermo tem fastio, levando algumas bochechas para bayxo.

## Raiz da Calumba, & suas virtudes.

Esta raiz serve para todas as febres moida com agua por quasi hum quarto de hora, & se dà pela manhãa, & à tarde, & ainda que seja mais quantidade de quartilho, não importa; & para febres, & frios se moerà com çumo de limão gallego.

Serve para mordechim, & para dores de colica, & indigestões do estomago; se forem de frio, se darà com vinho; & se forem de quentura, se darà em agua pela manhãa em jejum, ou a toda a hora que a necessidade o pedir.

Nas suppressões de ourina, altas, ou bayxas, he remedio que obra effeytos maravilho-sos, com tal condição, que o doente tenha tomado primeyro hum, ou dous vomitorios de seis grãos de Tartaro emetico, ou de meya oytava de caparrosa branca, ou de duas onças de agua Benedicta, & se tenha sangrado depois disso oyto vezes nos braços. Dá-se o pó deste remedio em agua cozida com os pàos da faveyra seca, ou com raizes de espargo.

Serve para camaras moida com çumo de limão gallego, & destemperada com agua, & se untaràő a barriga com o polme desta raiz pela manhãa, & à tarde.

Serve para mulher que estiver de parto, ainda que esteja mortal, & lhe darão moida com vinho, & lançarà a criança, ainda que esteja morta.

Serve para mordedura de todos os bichos peçonhentos, moida com agua; & se não ou-ver tempo de se moer, tome-se hum pedaço, & mastigue-se, & engulir o çumo, & se dey-tarà delle na mordedura, & se for muyto refinada a peçonha, se darà a alguma pessoa a dita raiz para que a mastigue, & tendo a na boca.

Serve para toda a peçonha que se der no comer, ou beber moida com agua; & se não ou-ver tempo para isso, tome hum pedaço na boca, & mastigue-o, levando o çumo, ou cus-po para bayxo.

Serve para quem tomar Anfião misturado com azeyte, porque então se converte o dito Anfião em refinado veneno: seu unico remedio he dar ao doente hum pouco de pó desta raiz misturado com agua. Tambem he grande remedio esfregar os dentes com o pó desta raiz. Anfião he o mesmo que Opio, como diz o Doutor Francisco Roballo Freyre, que foy Fisico mòr no Estado da India, & D. Rafael Bluteau no primeyro tomo do seu Voca-bulario Portuguez, & Latino fol. 373. col. 1.

Serve para uzagre do mesmo modo, fazendo primeyro lavatorio.

Serve para provocar o sangue mensal, com tal condição, que a mulher a quem faltar o dito sangue, tome oyto dias em jejum quatro onças da agua, em que tenhão cozido meya oytava do pó da dita raiz.

Serve para quem tiver dor de dentes, metendo na cova do dente hum pedacinho desta raiz, tirarà a dor.

Serve para erysipela, moida com çumo de limão gallego, untando com ella o lugar que tiver a dor, ou inchação; não havendo febre, se poderà beber em agua.

Serve para quem for tocado do ar, moida com çumo de limão gallego, para se untar.

Serve para a pessoa, que estiver com ventosidades, moida com vinho; & se forem de quentura, com agua, & se beberà. Nas terçans, & quartans tam rebeldes, que se não ti-rão com a quina quina, obra maravilhosos effeytos, tomando-a cinco, ou seis dias.



## Serpentaria virginiana, & suas virtudes.

Esta erva naõ he nascida na India Oriental, mas he natural das Indias de Castella; he muyto usada na India na febres malignas, & soccorre às doenças venenosas. Tem estupenda virtude, & he o mayor remedio que tem o mundo para ven-cer o mortal veneno das mordeduras da cobra de Cascavel, a que os Inglezes chamão Rat-tle-Snakes.

## Raiz de Sapuche, & suas virtudes.

Esta raiz tambem he de grande estimação, & he o mais fino contraveneno para as cobras que se tem descuberto: quando nasce esta planta, as cobras lhe costumão tirar a folha por instincto natural, para que se naõ conheça; mas por isso mesmo he conhecida; atada ao braço chegada à carne, està livre quem a trouxer, (ainda que durma na charneca) de lhe toccar bicho peçonhento.

He excellente antidoto contra todo o veneno de bichos, & contra os outros venenos: preparada em agua, & bebida, cura aos enfermos de dores do estomago: & bebida pelas manhas em jejum desfaz todas as obstrucções, & ajuda a circulação do sangue.

## Raiz de João Lopes Pinheyro, & suas virtudes.

Serve, preparada em agua, & bebida, contra febres; & preparada em pó subtil; para as feridas frescas com o sangue, fazendo cura aberta; & para as caneladas frescas, cobrin-do-as com os pós.

Serve para as pontadas, moida, & misturada com vinho, untando com o tal polme a pontada, a cura bem.

Serve preparada em agua, & bebida, para desfazer as opilações do ventre sendo conti-nuada; & para as obstrucções do estomago.

Serve, preparada em agua, & tomada em bochechas repetidas, para dor de dentes: faz effeytos milagrosos naquellas pessoas a quem mordeo huma casta de viboras que ha na In-dia taõ venenosas, que se ferem a alguma pessoa, logo cahe por terra amortecida, & des-mayada, que naõ pode fallar, nem se move, nem tem acção alguma de vivente; cujo unico remedio, & esperança de vida consiste em fazer lhe huma pequena ferida no alto da cabeça com huma lanceta, ou alfinete, de sorte que faça sangue, & deytando hũa migalha daquel-le pó na tal ferida, logo de improviso falla o homem, & fica livre do perigo.



## Raiz da Butua, & suas virtudes.

Esta raiz tomou o nome do Reyno da Butua onde se cria; chama-se assim nos Rios de Sena entre o Gentio; entre os Portuguezes se chama Parreyra brava, ou Raiz da Butua.

Serve o pó desta raiz, misturado com agua commua, para beberem as pessoas, que tive-rem algum apostema, ou abscesso interior, porque se o tal apostema, ou abscesso for novo, & estiver ainda no principio, o resolverà, & desfarà em poucos dias; mas se for jà velho, ou tiver jà materia, o farà abrir, & rebentar, & deytar fóra toda a materia por sima, ou por bayxo, pela camara, ou pela ourina.

Tambem o pó da dita raiz misturado com vinagre destemperado de modo que fique em fórma de polme, applicado sobre os apostemas, ou abscessos exteriores, os resolve, & des-faz, com tal condiçaõ, que se applique sete, ou oyto dias successivos: assim o observey muytas vezes, principalmente na mulher de Manoel de Araujo, morando junto da Igreja da Annunciada: tinha a dita mulher huma perna inchada com taõ excessiva deformidade, que a todos pareceo impossivel escapar da morte, & applicando sobre a inchação o polme desta raiz, sarou dentro de seis dias, sem necessitarde outro remedio.

Serve para o Pleuriz, dando a beber o pó della em agua quente, que primeyro seja cozi-da com papoulas, ou com cevada. Tambem se unta, ou esfrega a pontada com o polme da tal raiz, porque faz resolver, & descoalhar o sangue, que por estar reprezado, & gros-so, se naõ póde circular, & porque se naõ circula, se azeda, & por se azedar, faz a dor, & pontada do Pleurız.

Serve para pancadas, & quedas, dando a beber meya oytava do seu pó, misturado com a-gua cozida com huma raiz de tormentilla, chamada vulgarmente solda, ou pentafilão, un-tando por alguns dias a parte dolorosa com o polme da dita raiz.

Serve para esquinencia, ou garrotilho, dando a beber o seu cozimento, fazendo com el-le gargarismos, & untando a garganta com o seu polme.

Serve para fazer deytar as pareas, dando a beber a agua em que for cozida; tambem faci-lita o parto, & faz deytar as molas com facilidade.

Serve para desinchar toda a sorte de tumor, untando por oyto dias a parte com o dito polme.

Serve para erysipelas bem cozida em agua commua, applicando-a muytas vezes no dia em pannos picados mornos, com condição que os naõ deyxem secar.

Serve para toda a chaga, ou inflammaçaõ do figado cozida em agua commua, lavando a parte queyxosa repetidas vezes com o tal cozimento; advertindo que quando se quizer co-zer, se farà em lasquinhas miudas, ou se machucarà, para largar melhor na agua a sua gran-de virtude.

Serve para curar hernias ventosas, aquosas, & carnosas, applicando-se sobre a parte quey-xosa o cozimento da dita raiz quente, repetindo se muytas vezes no dia pannos ensopados na dita agua quente, porque logo mitiga a dor, & a inflammação. Confesso que esta raiz tem grande virtude para curar hernias; mas o mayor remedio que se sabe depois que Deos creou o mundo, para hernias, he o oleo verdadeyro de canela, como o poderà certificar o Doutor Mathias Mendes Ouvidor da Alfandega. Nao he menos efficaz para as quebradu-ras o oleo das gemas de ovos, de que possio apontar muytos exemplos.

Serve para dor de dentes o cozimento desta raiz, tomando-o na boca, ou metendo na cova do dente o pó desta raiz, misturado com agua da Rainha de Hungria, de que tenho visto maravilhosos proveytos.

Serve para dores de cabeça, & dexaqueca, misturando se o pó da tal raiz com agua rosa-da, ou de murta, & barrar toda a testa de orelha a orelha com este polme.

Serve para curar as dores de colica, & de barriga, que procederem de ventosidades, ou de causa fria, bebendo o cozimento da dita raiz, & untando o ventre com o seu polme.

Serve para desfazer as inchações do baço, & da barriga, tomando em vinte manhãs hũ escropulo do seu pó subtilissimo, misturado com duas onças de bom vinho branco agua-do, & fazendo com este remedio algum exercicio, se o doente o puder fazer.

Serve para curar as camaras, principalmente as de sangue, bebendo o seu pó misturado com agua de tanchagem, ou có agua commua cozida com alquitira, usando deste remedio por cinco, ou seis dias successivos pela manhãa, & à noyte. Luis Serrão Pimentel, Cas-mografo mòr do Reyno, póde ser testemunha desta verdade, pois estando elle sem espe-ranças de remedio humano, sarou de camaras com o pó desta raiz. O mesmo admiravel proveyto vi em huma mulher moradora à Boa Vista na rua chamada o Poço das taboas; ti-nha a dita mulher camaras taõ desenfreadas, & antigas, que suspeyto u lhe tinhão dado al-gum feytiço, que a fossem atando lentamente, & tomando esta raiz em seis dias depois de mil remedios baldados, sarou por modo de milagre.

Serve para as dores de estomago, & para azedumes da boca, bebendo a agua em que for cozida, misturando o seu pó com a ourina do mesmo doente, & untando o estomago com o polme da dita raiz feyto com a sua ourina.

Serve para as carnosidades, bebendo por muytos dias a agua da sua infusao, & siringan-do o cano com ella.

Serve para todas as suppressoens da ourina, dando a beber ao doente a agua que for le-vemente cozida com a tal raiz, mas com tal condição que antes de usar desta agua, tome o primeyro dia hum vomitorio de tres onças de agua Benedicta, ou seis grãos de Tartaro e-metico, & nos dous dias seguintes tome seis sangrias nos braços, & no terceyro comeceo o doente a tomar a tal agua, & conhecerão o muyto que me devem por lhes dar este conse-lho.

Serve para as purgações da madre, de qualquer cor que sejão, bebendo por 30. dias em jejum, & à noyte seis onças da agua da sua infusao, a que ajuntem doze grãos de pó subtil da dita raiz. Toda a casa do Senhor de Aguasbellas pode ser testemunha desta verda-de, porque estando na dita casa huma criada, que havia nove annos padecia a dita purga-ção, que a nenhum remedio obedecia, só com esta raiz sarou.

Serve a agua desta raiz, tomada por vinte dias em jejum, para provocar a conjunção às mulheres, que por falta desta descarga padecem mil achaques; mas he necessario fazer com o tal remedio exercicio de huma hora.

Serve para abafamentos, & flatos melancolicos, dando a beber a agua da dita raiz.

Serve para caneladas, untando-as com o polme da dita raiz.

Serve para curar feridas frescas, lançando nellas o pó finissimo da dita raiz.

Serve contra o garrotilho, & esquinencia, untando toda a garganta com o polme que se faz da raiz da Butua pulverizada subtilmente, & misturada com vinagre.

Serve o cozimento desta raiz para curar fogo salvagem, & leycenços, lavando-se muy-tas noytes com elle.

Serve, em falta do meu Bezoartico, para rebater toda a sorte de veneno; & he grande remedio para os apestados, com tal condição que se deve beber o seu cozimento, & untar a parte offendida com o polme da dita raiz.

Serve contra todas as mordeduras de cão danado, & bichos peçonhentos, bebendo se a agua da sua infusao, & untando a mordedura com o seu polme.

O Doutor Francisco Roballo Freyre, Cavalleyro professo da Ordem de Santiago, & Fisico mór no Estado da India, certifica que dera em tres dias successivos o cozimento desta raiz a huma mulher, que tinha na região da madre huma inchação fleumonosa, que se naõ pode curar em largos tempos, & só com o cozimento da raiz da Butua se amadurou o apostema, rebentou, & deytou muyto humor, & ficou saa.


## Raiz Divina, & suas virtudes.

Esta raiz nasce em Portugal, em hum lugar vizinho a Cetuval, a que chamão Troya: naõ sabemos que haja Author que escrevesse della; porèm a experiencia dos bons ef-feytos que obra em algumas enfermidades, saõ as mais qualificadas testemunhas das suas virtudes. He a dita raiz inclinante a quente, por cuja causa se naõ deve usar della muyto cozida, mas com huma moderada fervura, de sorte que com duas canadas de agua se coza huma oytava da dita raiz levemente machucada: desopila muyto as veas, provoca a con-junçaõ das mulheres, & aproveyta nas inchações do ventre das mulheres que parecem hydropicas: não duvido tenha outras muytas virtudes, que o tempo irà descobrindo; mas por hora fallo só naquellas, de que jà temos experiencias. Chama-se esta raiz Divina pelos seus grandes prestimos.

## Maçãa do Leão, & suas virtudes.

Assim como no bucho de algumas vacas se gera huma maçãa do tamanho de huma la-ranja pequena, tambem no bucho de alguns Leões se cria huma bola, ou maçãa do tamanho de hum ovo; esta bola roçada em agua, ou vinho, ou hum pouco pó della dado às mulheres que naõ pódem parir, no mesmo instante parem, & deytão as pareas; & pro-voca efficazmente a conjunçaõ dos meses.

## Maçãa do Elefante, & suas virtudes.

Nos buchos dos Elefantes muyto velhos se achão muytas vezes humas maçãs, ou bo-las tamanhas como hum ovo de gallinha; desta pedra, ou maçãa se tem achado que he taõ boa como a mais excellente pedra bazar que vem da India; he verdade que amarga muyto quando se toma, & este he hum grande sinal de ella ser boa; a quantidade em que se toma saõ de 10. grãos até 16. toma se misturada com quatro onças de agua de cardo santo, ou de papoulas, & se abafa o doente muyto bem para suar; aproveyta muyto para as dores de barriga, para febres, para dores de costado, abre as opilações do figado.

## Oleo do Elefante, & suas virtudes.

As canelas, & mãos do Elefante depois de tirada a carne se pendurão com o osso pa-ra bayxo, & pondo-as ao sol, & destes ossos que saõ esponjosos destilla, ou faz hum oleo, que se apara em hum vazo limpo, & se guarda em vazo de vidro bem fechado, & se es-tima como remedio especifico, & admiravel para asthma, & faltas de respiração; appli-ca-se quente ao peyto esfregando-o com brandura por tempo de vinte Ave Marias, porque deste modo communique melhor a sua virtude; tambem aproveyta muyto esfregando com elle a parte em que estiver alguma dor de causa fria, advertindo, que quando se appli-car este oleo, seja com grande resguardo do ar frio, porque he muyto penetrativo.

## Cobra de Cascavel, & suas virtudes.

Nas terras do Brasil se crião humas cobras tam venenosas, que mordendo em qual-quer parte do corpo, communicão repentinamente huma qualidade tam pestilente ao sangue, que o adelgaça, & faz sahir do corpo com tal furia, que sahe pelos ouvidos, pe-la boca, pelo nariz, pelos olhos, pelo cano da ourina, até lhe esgotar, & morrer a pessoa mordida. Chama-se esta cobra naquellas terras Xenninga, & entre os Inglezes se chama Ratthe-Snakes. Tem na cabeça hum cascavel, que a natureza lhe criou, para que vindo tangendo se ouça de longe, & tenha a gente tempo para fugir. Este cascavel trazido ao pescoço, affirmão os naturaes daquella terra, que tem virtude de preservar de accidentes de gotta coral, & de vágados. O remedio com que escapão da morte as pessoas mordidas por esta venenofissima cobra, he tomar huma oytava de pó do unicorne da Ave chamada Inhume, ou Anhume, ou huma oitava de pó da raiz de serpentaria virginiana, & em falta destes remedios, póde tomar hum pouco de esterco de homem acabado de sahir do corpo; & não tem outros remedios este veneno.

## Maçãa da Vaca, & suas virtudes.

Nos buchos de algumas vacas se crião hũas bolas redondas como laranjas, que saõ de cor parda muyto leves, & por dentro estãocheyas de cabellos: esta bola, ou maçãa roçada com agua até que faça hum polme, dada por alguns dias aos camarentos, os alivia muyto.



## Pedra que se cria dentro no fel da vaca, & suas virtudes.

Dentro no fel de algumas vacas se crião humas pedras taõ amarellas como he o aça-frão; estas taes pedras tem grande virtude para curar a Ictericia, com tal condiçaõ, que o doéte esteja primeyro bem evacuado: tomão-se vinte grãos da tal pedra pulverizada, quinze dias em jejum, misturando-a com seis onças de agua cozida com folhas de moran-gos, ou com raizes de grama.

Em minha casa tenho hum remedio, ou segredo taõ efficaz para curar a Ictericia, que sendo eu Medico ha cincoenta annos, ainda nao achei outro taõ certo como este, & o tenho em minha casa só a fim de tirar a occasião a alguns Boticarios pouco escrupulosos, para que naõ vendão o tal remedio, dizendo, que lho revelei, como dizem hoje muytos, que eu lhes revelei o meu Bezoartico, & outros remedios que inventou a minha curiosidade, & que ninguem sabe como saõ compostos, nem os ingredientes que entrão na fabrica delles, & sem embargo disso, raras saõ as boticas aonde se peça o Bezoartico do Curvo, & outros segredos mais, que naõ digão que o tem, sem fazer escrupulo dos graves damnos, que se se-guem de vender os remedios adulterados por verdadeyros.

## Páo de Largis.

A Arvore chamada Largis he pequena como hum pessegueyro; as suas folhas saõ córa-das, cria-se nos confins da Persia junto a Turquia; são poucas, & muy raras as ditas arvores.

A principal virtude da casca desta arvore he contra a Ictericia, trazida no pescoço junto à carne; naõ se toma cozida, nem preparada em agua, como cà se tem introduzido. Da casca desta arvore, chamada Largis, com raiz de losna, & uvas passadas se faz hum quasi divino xarope para Ictericias, como se póde ver na minha Polyanthea da segunda impressão trat. 2. cap. 64. fol 409. num. 13. Este xarope, em que entra Largis, he taõ efficaz para a Ictericia, como he a quina quina para as sezões, & como he a salsaparrilha, & o azougue para o gallico. O modo com que se faz o dito xarope para a Ictericia, & a quantidade em que se toma, acharão os curiosos no lugar citado da minha Polyanthea.

## Páo Cobra, & suas virtudes.

Este páo na lingua do Gentio, se chama Dangya Catenga, outros lhe chamão Catubia; o nome de páo Cobra lhe derão os Portuguezes, por ser o mais efficaz remedio do mundo para as mordeduras das cobras mais venenosas.

Serve o pó deste páo sulado, ou moido muyto subtilmente, para remedio das grandes febres, dando-o a beber em agua, & untando com o seu polme o corpo: serve para qual-quer dor quente, ou fria, ou inchação, ou gotta, untando com o seu polme a parte dolo-rosa.

Dizem os naturaes daquellas terras, que esta raiz se deve colher no minguante da Lua, tomando a raiz que fica para a parte do nascente, porque a do poente nao tem virtude; an-tes dizem, que he prejudicial.

Do pó desta raiz se póde dar meya oytava misturada com agua.

Applica-se com grande utilidade sobre as pontadas, tomando-o tambem pela boca.

Na inchaçaõ das pernas faz o tal polme consideravel proveyto.

O pó desta raiz misturado com a agua em que tiverem cozida a erva Anagalis, a que cha-mamos Marugem, ou misturado com espirito de vinho alcanforado, cura por modo de encantamento as Erysipelas, có tal condiçaõ que se applique morno, & não se deyxe seca.

Nas parlesias se póde dar pela boca a agua em que for sulada esta raiz, untando tam-bem a parte paralitica com o seu polme muytas vezes no dia.

Nas dores de estomago faz maravilhoso proveyto o tal polme jà bebido, jà untando-o com elle: doente ouve, que estando desesperado com dores de estomago, o untou com o polme da tal raiz, & porque o doente molhou a maõ no dito polme para esfregar com elle o lugar da dor, naõ só melhorou della, mas tendo a mam com gotta, se tirou a gotta, nem a teve mais em sua vida.

Nas feridas obra maravilhosos effeytos deytando lhes os ditos pós: serve este pó para dores da madre, jà bebido, jà untando o pentem com elle.

Alimpa os rins de areas.



## Páo Quiriato, & suas virtudes.

Ralado em pó subtilissimo, & dado a beber em agua, he grande contrapeçonha, & contra mordeduras venenosas.

## Raiz de Monguż, & suas virtudes.

Esta raiz tomou o nome de hum animalejo, que tem a fórma, & corpo de hum furão; este costuma pelejar com as cobras, & tanto que se sente ferido, larga a peleja, & vay buscar a raiz, & mastigando-a volta a continuar a briga, & assim se cura, & defende das mordeduras da cobra, até que a mata, & o Monguz fica salvando a vida nesta fórma.

Serve moida em agua, & bebida, & posta sobre a mordedura, contra todas as feridas de bichos peçonhentos.

Serve na mesma fórma, bebida em pequena porção, contra toda a outra especie de ve-neno, & contra as febres, & dores Nephriticas; & farà muyto melhor os seus effeytos, se se der a beber depois que o doente tiver tomado tres onças de agua Benedicta, ou seis grãos de Tartaro emetico.

Serve, trazida no braço junto à carne, para defensivo dos bichos peçonhentos; & pre-parada em azeyte sem sal, serve para curar as inflammaçoens, & bostelas da cabeça.

## Coco de Maldiva, & suas virtudes.

Este coco nasce no fundo do mar, tem a fórma de rim, & nascem na arvore dous pega-dos, a casca negra, & o miolo com a casquinha parda; he branco como o coco que se come, ou de branco para pardo; da casca se fazem pucaros como barquinhas, com pés, & azas de prata para beber, porque he grande contraveneno; & os Mouros, & Gentios da Asia fazem delles grande estimação: a onça deste coco tem mais de dobrado valor da pe-dra Bazar.

Serve, preparado em agua, & bebido, contra todo o veneno, & para as febres, & para ventosidades melancolicas, & para as obstrucções; & he admiravel cordeal para as bexi-gas.

Tem virtude para absorber os humores venenosos, & circular o sangue, usando delle; & tambem faz grandes effeytos nas febres malignas, & nas febres procedidas de Pleurizes.

## Coquinho de Melinde, ou Macoma, & suas virtudes.

He fruto de huma arvore chamada Macomeyra, & tem huma casca muyto dura, que se naõ corta senaõ com serra; he muy felpuda, & dentro tem o coquinho, como o co-co de comer.

Applica-se contra as ventosidades bebido em agua. Tambem se usa delle na mesma fór-ma contra os flatos, & para abater a colera, & confortar o estomago resfriado, ou relaxado.

## Raiz de Mil-homens, & suas virtudes.

Cria-se esta raiz no interior do Certão do Brasil, & se applica contra toda a especie de veneno, & sendo de bichos peçonhentos, bebendo-a preparada em agua, & pon-do os pós da raiz na ferida.

Serve, bebida na mesma fórma, contra febres malignas, & contra inflam.mações do figa-do, & bofe; & os pós preparados, & lançados nas chagas da gangrena, he remedio excel-lente, & curativo; posta tambem a raiz da parte para onde querem que naõ corra a gangre-na; & usa-se della para toda a enfermidade; & por ser universal a sua virtude, lhe derão o nome de Mil-homens.

Dado o pó desta raiz em huma onça de agua ardente cura presentaneamente as dores de colica, tem virtude vomitiva, & por esta razãó cura muytas doenças com grāde felicidade. Provoca vomitos, & por este caminho aproveyta em muytas enfermidades.


## Raiz de Tambuape, & suas virtudes.

Nasce na Bahia, & tem grande virtude contra veneno; preparada, & bebida em agua serve contra as dores de estomago, & lombrigas.

## Batatas do campo, & suas virtudes.

Estas Batatas naõ se achão senaõ no interior do certão do Brasil, onde tambem se crião a Tambuape, & Milhomens, & saõ raras.

A sua virtude não he outra mais que hum finissimo contraveneno para as mordeduras de bichos peçonhentos, tomando a batata preparada com agua, & pondo-a na ferida.

## Fava de Melinde, & suas virtudes.

He excellente remedio (preparada em agua, ou em vinho, & bebida) contra o mor-dexim, & contra dores do estomago, & do ventre. Tambem se applica para ventosi-dades, & para quartans.

## Raiz do Queijo, & suas virtudes.

He esta raiz muyto quente, & por isso se applica às enfermidades, que procedem de frieza; he melhor, para quem tem falta de somno, he melhor para os lethargicos, & modorrentos: para dar despertar os humores frios, grossos, & humidos, se ha de moer em pó subtilissimo, ou roçar em huma pedra com çumo de limão gallego, ou com qualquer outro, de sorte que fique hum polme muyto liquido, & deste polme se deytão cinco, ou seis gottas nos lagrimaes dos olhos: o qual remedio o-bra maravilhosos effeytos nos accidentes de gotta coral, porque repentinamente tira o ac-cidente, & entra o enfermo em seu perfeyto juizo, como certamente me consta.

Serve o pó desta raiz, misturado com humas gottas de çumo de limão azedo, para o ar; mas ha de deytar se dentro nos olhos, no mesmo dia que der o accidente, porque desta sor-te nem irà o mal por diante, nem tornarà a dar mais vezes.

Do mesmo modo se applica o pó da dita raiz para todo o genero de peçonha, assim co-mo mordedura de cobra, ou de outros quaesquer bichos peçonhentos, untando com o polme da tal raiz a parte onde o bicho mordeo; sendo que o principal remedio he, tomar o tal pò pela boca misturado com meyo quartilho de agua rosada, ou de escorcioneyra: & se a pessoa, a quem morderão os taes bichos, estiver tam desacordada que pareça morta, fa-ção lhe tres, ou quatro sarrafaçaduras entre as sobrancelhas, ou na moleyra; & se deytar sangue, untem-o muyto bem sobre a mordedura, & com o favor Divino tornarà em si, & vivirà.

Serve mais para assombrados, & endemoninhados, & a estes se applica para que se và o Demonio, porque naõ ha de esperar que se lhe deyte em os olhos quatro vezes.

Serve o polme desta raiz, feyto com çumo de limão azedo, & deytado nos lagrimaes, para despertar os bebados.

Serve tambem para madurar, & fazer vir a furo os apostemas, untando se aquella parte que quizerem que arrebente, com o polme da dita raiz.

Serve para a dor de enxaqueca, feyta a raiz em pó, & tomada pela venta contraria onde està a dor, como se toma o tabaco.

Serve para fazer vir a regra às mulheres, & para os accidentes da madre, chamados ute-rinos, a que as mulheres ignorantemente dizem que lhes subio a madre à garganta, & que as afoga.

Se com o pó desta raiz misturarem outro tanto pó de gengibre, & meterem huma pou-ca desta mistura pelas ventas do doente que tem modorra, infallivelmente acordarà do somno, & espirrarà; & se nem acordar, nem espirrar, he sinal de morte.

Soccorre grandemente àquellas pessoas, a quem se deo algum veneno, pondo lhe o pó da tal raiz nos olhos com çumo de limão, & dar lhe tambem a beber huma pouca quantidade della.

Aproveyta muyto aos camarentos, com tal condiçaõ, que naõ se applique nos primey-ros dias das camaras, porque as póde estancar logo, & não he seguro reprezar logo os hu-mores, mas convem deyxar descarregar a natureza.

Sobre todas as virtudes da raiz do Queijo, a que leva a palma, he que acorda aos doentes, que tem modorra, ou somno taõ profundo, que naõõ sentem as ventosas sarjadas; no qual caso o pó subtil da raiz do Queijo, misturado com tantas gottas de limão azedo, que fique hum polme, deytado este nos lagrimaes dos olhos, os acorda de sorte que ficão capazes de se confessar, & fazer testamento; mas porque nem em todas as terras se acharà a raiz do Queijo, quero, em soccorro dos que tiverem somnos pesadissimos, ensinar lhes outro re-medio facil, com que certa, & infallivelmente acordarão, & naõ poderàõ tornar a dormir, sem tomarem amendoadas. O remedio he, dar ao doente por tres dias em jejum quatro on-ças de infusaõ dos trociscos de Alhandal, coada por papel mata borrão. Os que quizerem certificar se da quasi milagrosa virtude que este remedio tem para vencer todas as mo-dorras, & affectos soporosos, vejão a minha Polyanthea da segunda impressão trat. 2. cap. 15. pag. 123. num. 1. aonde acharão nomeados os doentes, que depois de estarem ungidos, & pranteados por causa de modorras invenciveis, livrey da morte com o sobredito remedio. Peço pelas chagas de Christo a todos os Medicos que naõ desprezem a este remedio, porque no discurso de 50. annos ainda naõ achey outro tam efficaz para vencer as modo-rras como he a dita infusaõ.


## Raiz de Ginsaõ, & suas virtudes.

Esta raiz vem da China, & se faz della grande estimação; tem virtude contra febres a-gudas, & querem que seja tomada cozida com frangão, para aquelles enfermos que estão nos ultimos paroxismos. Mas a razão diz, que tomada pequena porção em agua da fonte, & bebida no mesmo caldo de frangão, ou franga, he admiravel remedio para qualquer enfermo prostrado, des-falecido, ou esfalfado. Ajuda muyto aos fastientos, porque lhes excita o appetite de comer.

## Raiz de Moçuaquim, & suas virtudes.

Esta raiz se cria na costa de Moçambique defronte das Ilhas de Querimba; he singular, porque as suas virtudes saõ de contacto.

Trazida ao pescoço cahida sobre a carne, preserva de toda a erysipela na cara, & de todo o genero de maleficios, & do ar; & suspende a erysipela, posta da parte para onde naõ que-rem que corra.

## Aranhas do Peru, & suas virtudes.

No Peru, ou Indias de Castella ha humas aranhas muyto grandes, taõ venenosas, & peçonhentas, que em breves horas matão as pessoas a quem mordem. O remedio mais certo, & infallivel, que se tem achado contra hum veneno taõ presentaneo, he untar a mordedura cinco, ou seis vezes cada dia com o leyte que deytar de si huma folha de fi-gueyra daquellas terras, cortando-a com huma faca. Digo, figueyra daquellas terras; por-que sendo as taes figueyras muy semelhantes, & parecidas com as de Portugal, differem com tudo, em que as de Portugal perdem as folhas tanto que chega o Inverno; mas as do Peru as conservão verdes todo o anno; o que sem duvida foy altissima providencia de Deos; porque como o leyte das suas folhas he o total remedio das taes mordeduras, quiz Deos que todo o anno as ouvesse para soccorro dos homens, & remedio das ditas morde-duras.

## Páo de Angariari, & sua semente.

Esta arvore se cria em o Reyno de Angola: o páo da dita arvore, & os frutos, que saõ huns caroços compridos como caroços de tamaras, tem grandissima virtude para provocar a ourina, & para desfazer a pedra dos rins, & da bexiga; alimpa todas as difficul-dades, & humores seculentos, que se crião nas sobreditas partes, deitando-os pelas ouri-nas. Tem muyta virtude na cura das hydropefias, de qualquer casta, & condição que sejão.

O modo de usar deste páo ou frutos, para que fação o bem que se pertende, he o seguin-te. Duas oytavas deste pão limado, ou feyto lasquinhas miudas, se deytaràõ em huma pa-nela de barro com huma canada de agua da fonte, & se deyxarão estar de infusaõ por tem-po de 24. horas, no fim das quaes se ferverà de modo, que de quatro quartilhos fiquem tres, & desta agua coada darão ao doente meyo quartilho em jejum, & outro ao sol posto, naõ comendo nem bebendo cousa alguma, menos que tenhão passado tres horas; adver-tindo, que para este remedio fazer os grandes proveytos que costuma nas suppressioens de ourina, deve o doente ter tomado primeyro dous vomitorios de Tartaro emetico, ou de caparrosa branca, sangrando se no seguinte dia quatro vezes, & no terceyro tres; porque este caso he taõ perigoso, & summario, que se lhe nao acodem com grande pressa, mata dentro de oyto, ou nove dias. Eu tenho huma tam grande crença, & experiencia dos vo-mitorios de Tartaro emetico, ou de vitriolo branco para remedio das suppressoens, ou se-jão altas, ou bayxas, que os anteponho, & uso primeyro que as sangrias. Advirto que se este remedio falhar, que eu tenho hum segredo tam maravilhoso, que tornarey o dinhey-ro, que me derem por elle, se dentro de quatro dias naõ fizer o effeyto desejado; mas com tal condiçaõ, que o doente tome primeyro que tudo os vomitorios de Tartaro emetico, ou de quintilio, & oyto sangrias nos braços: os q́ quizerem certificar se da verda-de, & virtude do dito remedio, vejam a minha Polyanthea da 2ª impressao trat. 2. cap. 81. fol. 509. de num. 36. até 42. aonde acharàõ nomeadas as pessoas que estando ungidas, & tidas por incuraveis, livrey de suppressoens altas por mercè de Deos, & beneficio do meu se-gredo.



## Unicorne da testa da Ave chamada Inhuma, ou Anhuma, & do espo-rão que tem no encontro das azas, & suas virtudes.

Nas lagoas, & Rio de Sao Francisco das Capitanias do Brasil andão humas aves, a que os Naturaes chamão Anhuma, ou Inhuma: tem as ditas aves na testa hum corno delgado, da grossura de hum bordão de arpa, & do comprimento de quasi hum pal-mo; & nos encontros das azas tem hum esporão triangular do comprimento de hum dedo, tam duro como se fora hum osso: estes esporões, & corno da testa da dita ave tem maravi-lhosa virtude bezoartica contra todo o veneno, & contra toda a malignidade dos humo-res, chamando-os por suor de dentro para fóra, com tanto, que se deve dar hum escropu-lo do dito esporão, ou corno feyto em pó misturado com quatro, ou cinco onças de agua de cardo santo, ou de escorcioneyra.

He remedio muyto celehrado naõ só contra todos os venenos; mas he infallivel remedio para os mordidos da cobra de Cascavel, cujo veneno he tam refinado, & activo, que no mesmo instante em que a dita cobra mordeo em qualquer parte, faz sahir todo o sangue do corpo, assim pela boca, como pelos olhos, pelos ouvidos, pelo cano da ourina, pelo nariz, pelas unhas, & pelo trazeyro; assim o mostrão as experiencias de Guilherme Pisão lib. 3. histor. natur. sect. 2. de Avibus fol. 91. Soube-se da grande virtude do unicorne da ave Inhuma, porque bebendo naquellas lagoas varios bichos venenosos, o instincto natu-ral ensinou aos animaes que vivem naquelles contornos, que se ajuntassem todos ao pe daquelle rio, & nao bebessem sem que a ave Inhuma metesse primeyro a sua ponta, & es-porão das azas na dita lagoa, mas depois que a mete, bebem todos confiadamente, sem que corrão perigo.

E se algum dia acontecer que a cobra de Cascavel (que he venenofissima) morder algu-ma pessoa, & naõ tiver o unicorne, ou esporão das azas da sobredita ave Inhume, póde to-mar hum pouco de pó da raiz da serpentaria virginiana, que na opiniã de Roberto Boi-le, & de outros Authores graves, he o mayor de todos os antidotos contra estas, & outras mordeduras venenosas; & na falta de qualquer destes dous antidotos, se póde tomar hum pouco de esterco fresco da mesma pessoa mordida, porque sem embargo de que he reme-dio horroroso, he admiravel, como tem mostrado a experiencia dos que forão mordidos da dita cobra, ou de qualquer outro bicho peçonhento.

## Jamvarandim, & suas virtudes.

Na Bahia, ou em Pernambuco nascem humas raizes delgadas, & compridas, que os Naturaes daquellas terras chamão Jamvarandim, cuja virtude he milagrosissima contra todas as mordeduras de animaes venenosos, pizando-a, ou verde, ou seca, & pon-do a sobre a parte mordida; provoca muchissimo as ourinas; faz cuspir muyto mascando-a; he grande contraveneno, & tem outras infinitas virtudes, que pouco a pouco se vão desco-brindo com o tempo.

## Da tinta negra, que vem da China, que roçando-a levemente com agua commua, faz huma tinta muyto mais excellente que aquella, com que escrevemos em Portugal.

Da China vem para a India humas talhadinhas negras, estreytas, & chatas, do compri-mento de hum dedo, das quaes humas saõ douradas, & outras não; cujo prestimo ordinariamente he para servirem de tinta para escrever; porèm tem outra serventia taõ ad-miravel, que todo o dinheyro do mundo he pouco para se pagar; porque quando os olhos se esbugalhão, de sorte que parece querem rebentar, & saltar fóra do rosto, faz a tal tinta hum effeyto taõ estupendo, & milagroso, como eu vi em huma filha de Cayetano de Mel-lo de Castro Viso-Rey da India. Deo a esta menina huma dor taõ repentina em o olho di-reyto, que de improviso inchou, & se fez tamanho como huma laranja, & quando todos temião que o olho rebentasse, pela grandeza a que tinha crescido a inchação, se sulou hu-ma migalha da dita talhadinha em hum didal de agua da fonte, & com esta agua, ou polme negro se untou a palpebra de sima, & de bayxo, & foy cousa como de encanto, porque em duas horas se desfez a inchação, & a vermelhidão, & sarou por modo de milagre. He su-perior remedio para estancar todos os fluxos de sangue do peyto, misturando-a em agua de tanchagem, de sorte que fique a agua bem preta, & grossa como polme.

--- END CHUNK 18 ---

--- START CHUNK 19 ---

## Raiz da Maranga, & páo da mesma arvore, que tem semelhante vir-tude como tem a sua casca.

Serve para curar todas as feridas penetrantes, ou sejão de armas, ou de balas, applica-da na sóma seguinte.

Far se ha em pó muyto fino, & deste pó se formarà huma mecha, como se usa na Cirur-gia, & molhada esta com a saliva, se pulverizarà destes pós, & se meterà nas feridas; po-rèm advirta se que a mecha ha de ser do tamanho, & comprimento da mesma ferida, para que a penetre toda, & pelo contrario se solapara, porque tem tal virtude, que logo fecha; & em cada cura se irà diminuindo a mecha, dando lugar a que cresça a carne; & com esta cura se escusão outros medicamentos; & ainda que a ferida tenha sangue pizado, naõ ha mister mais medicamento que os mesmos pós, os quaes consomem, & espalhão todo o san-gue pizado que tiver a ferida; & ainda que seja penetrante, & no peyto, depois della fecha-da naõ ha mister lambedores, nem mais remedios.

Serve mais para curar toda a chaga velha, & rebelde, ainda que haja mister cauterizada, applicando-se à chaga os pós da dita casca, & todas as vezes que se curar, se lavarà a chaga com agua morna, & depois pulverizarà muyto bem com os ditos pós; & tambem cortão todos os labios da chaga, & carne podre, que fica como cauterizada, dando algu-ma molestia como ardor, que naõ dura mais que meya hora.

He tambem efficaz remedio para cursos de sangue, tomando a casca cozida com hum frangão recheado com ella, & sem sal, nem tempero algum, se darà o caldo a beber ao en-fermo pela manhãa em jejum, & de tarde, & brevemente sararà.

Tambem he proveytoſa a dita cura para dor de olhos, & ainda que seja com grande detri-mento do enfermo pelo grande ardor que causa, aproveyta muyto applicada na fórma se-guinte. Mandarão mastigar esta casca por qualquer pessoa de manhãa em jejum antes de lavar a boca, & depois de bem mastigada, a pessoa que a mastigou, bafejarà com a sua boca nos olhos do enfermo repetidas vezes, & continuando todos os dias com esta cura, breve-mente sentirà melhoria.

Tem propriedade a raiz, & páo desta arvore para afugentar todas as cobras, & viboras, & quem a trouxer com sigo està isento de que o offendão os taes bichos, porque em lhes dando o faro, ou cheyro daquella arvore, logo fogem.

Para as cutiladas abertas se applicão os mesmos pós com a cautela que fica dito, calcan-do bem a ferida, para que os pós cheguem ao fundo della; porque ficando alguma parte a que os pós naõ cheguem, solaparà logo de tal maneyra que serà necessario tornar a abrir a ferida, por ser tal a sua virtude, que logo cria carne nova, com que se une, & fecha a fe-rida.

## Raiz das febres, que vem do Canara, & suas virtudes.

Chamão os Portuguezes a esta raiz, Raiz Presta, & hoje por devoção se chama Raiz de Nossa Senhora das Febres, & assim serve para todo o genero dellas, que padece o corpo humano, mas para a maligna tem mais efficacia, & a sara em breve tempo sem al-gum outro medicamento: porèm se ha de advertir, que se o enfermo estiver abundante de sangue, depois de tomada a dita raiz tres vezes, fica huma febre sinhalenta, sinal de haver sangue demasiado nas veas, & assim depois de tomada por tres dias continuos, he bom to-mar algumas sangrias, & depois alguma purga conforme o temperamento do sugeyto; & se a quizer escusar, continue com a mesma raiz, & terà perfeyta saude: mas se a febre pro-ceder de abundancia só de humores, sem duvida se despede só com a primeyra vez que se toma a dita raiz; mas sempre he necessario tomalla tres vezes ao menos; & assim tendo malig-nas, ou terças simplices, ou dobres, ou continuas, ou quartãs, infallivelmente se despedi-rão; advertindo, que se ouver obstrucções grandes, como do baço, ou da boca do estoma-go inchada, tomada a raiz assim para lhe tirarem as febres, depois he necessario preparar ao doente com xaropes aperientes, & depois disso algumas apozemas de raizes frescas com cousas purgativas, a fim de ficar o sugeyto com mais perfeyta saude, & mais isento de tor-nar a adoecer.

Advirta-se, que se esta raiz se der para quartans, deve ser depois dellas continuarem dous ou tres meses, que he quando o humor de que ellas procedem, estarà jà cozido: & se as quartans forem dobres, ou vierem todos os dias, que he sinal de muyta carga de humor corrupto, neste se darà a raiz repetidas vezes em varios dias, porque deste modo se tem vis-to com ella admiraveis effeytos.

A quantidade que se dà de cada vez, he hũ pedaço como meyo palmo, naõ sendo a raiz muyto grossa, nem muyto delgada; esta he a quantidade ordinaria para qualquer sugey-to, que virà a pesar oytava, & meya; & estando o doente no principio da enfermidade, em o qual tempo naõ faltão forças, ainda que pareça ao doente estar fraquissimo, como succe-de nas malignas, em que se postrão, ao que parece, as forças havendo as em o corpo bas-tantes, se podem dar até duas oytavas por cada vez, para obrar bem.

Moe-se a dita raiz muyto bem em pedra, estando primeyro por algum tempo de molho em outra agua, & assim se moa em agua de beber; ou se o sugeyto estiver muyto facil em e-vacuar, se moa em a terceyra agua, em que lavão arroz, & assim moida, & muyto bem en-corporada se desfarà em quatro onças de agua; mas havendo sede, seja a sufficiente, com que a natureza se satisfaça, & depois de lançada a raiz moida com esta agua, se passará mansamente para outra porçola naduas ou tres vezes, para que se bote fóra alguma parte da raiz que naõ ficou bém moida.

O tempo ordinario he dalla pela manhãa, como outra qualquer medicina; mas a expe-riencia tem mostrado que dada quando a cezão quer começar a declinar, em tanta agua co-mo està dito, conforme a sede do enfermo, faz prodigiosos effeytos; este he o melhor tem-po para o seu bom successo.

Tambem se póde dar esta raiz, & sangrar no mesmo dia, sendo necessario; com adver-tencia, que dando se a raiz pela manhãa, serà a sangria às nove horas, ou de tarde; advertin-do tambem, que se a raiz tiver obrado muyto, nette caso nao convem a sangria no mesmo dia, porque he sinal de muyto humor; mas descansando o doente, se tornarà a dar a mes-ma raiz em menos quantidade, & sempre da primeyra vez se darà mais, que he até duas oy-tavas, & as mais vezes se dà huma oytava.

O regimento de quem toma esta raiz, he o commum em todas as doenças: nos princi-pios dietas commuas: & os Portuguezes pódem comer frangãos pequenos cozidos.

He tambem excellente esta raiz para aquella doença em que a lingua se faz negra, ou amarella.


## Raiz dos Apostemas, & suas virtudes.

Serve para resolver toda a sorte de apostemas, assim simplices, como compostos, inte-riores, & exteriores, & para toda a sorte de nascidas, mulas, & carbunculos; serve tam-bem para pizaduras de sangue por causa de quedas, ou pancadas.

Serve para Pleuriz, & toda a sorte de pontadas de sangue, & para todos estes achaques se applica na fórma seguinte. Tomar se ha esta raiz, & se farà em migalhas quantidade de duas onças pouco mais, ou menos, & se botarà a cozer em huma panelinha nova, que naõ tenha azeyte, ou gordura alguma, & ficando a agua deste cozimento da cor de vinho tin-to, se deytarà huma pouca de farinha de arroz, & se cozerà até que fique em ponto de a-mendoada, & se darà a beber ao enfermo, que padecer qualquer dos achaques acima apon-tados, tres vezes no dia, pela manhãa, ao meyo dia, & de tarde; & esta farinha se manda deytar a respeito do muyto asco que tem a raiz; & quem puder beber o cozimento assim mesmo, se póde escusar a farinha; & na agua que o enfermo beber se deytarão humas mi-galhas desta raiz a modo de infusaõ: & se o apostema, ou outra qualquer nascida estiver ainda em sangue, se resolverà em termo de 24. horas; & se estiver a materia feyta, se resol-verà em termo de tres ou quatro dias; & ainda que se resolva com esta brevidade, bom he continuar dous annos, quãdo menos hũ; & a razão he, porque naõ torne a acudir o humor ao mesmo lugar, ou a outra parte: & advirta-se tambem que depois de se resolver o apos-tema, ou outra qualquer nascida, darão duas sangrias nos pés ao enfermo, & huma purga refrescativa, para que despeça todo o humor, & malignidade, que a raiz tiver arrancado parte donde tinhão apostema.

Serve tambem para o baço, dada na fórma sobredita.

## Raiz do Ar, & suas virtudes.

Moida com agua, & depois de morna se untarà o corpo da pessoa que tiver o ar; & tambem se farà huma manilha, ou braçal de alguns pedaços, & se atarà no braço, ou em outra qualquer parte do corpo, & trazendo a com sigo tira a tortura que o ar faz na pessoa.

Serve tambem para febres, moida com tanta quantidade de agua, que baste para lavar todo o corpo na fórma de esfregaçaõ, & depois de bem lavado se cobrirà muyto bem com roupa bastante, & suando despede logo a febre.

## Arvore Quiriato, & suas virtudes.

Esta arvore, a qual chamão Quiriato, ou por outro nome Fucamena, he pequena, as suas folhas saõ do tamanho de hum palmo, de mediana largura, & crespas a modo de folhas de Cajueiro: a raiz desta arvore tem particular virtude para tirar dores de cabeça, ou ao menos para as moderar; della sulada com agua se faz hum polme que applicado sobre a tes-ta, & fontes da cabeça faz bem aos que tem dores de cabeça, com tal condição que este pol-me se repita muytas vezes, naõ consentindo que se seque.

## Oleo de alambre, & suas virtudes.

Com razão se póde chamar este oleo o mais excellente opobalsamo por toda a Europa, porque leva ventagem a todas as outras medicinas no curar o mal do ar, & outros grandes achaques: chamava-se no tempo antigo o Oleo santo.

Tomado o dito oleo no tempo de peste, todas as manhas, & noytes, seis gottas, & un-tando as ventas do nariz com elle, naõ consente pegar se veneno dos ares maos; & ao que estiver jà tocado deste mal se lhe dè a beber em agua de cardo santo, de hum até dous es-cropulos.

Quem se sentir com grandes fraquezas perigosas da cabeça, como he o ar, paralysia, gotta coral, &c. tome pelas manhas em jejum oyto gottas deste oleo em agua cozida com betonica, ou com alfazema, ou mangerona. Tambem feytos huns bolinhos de açucar, misturado com humas pingas deste oleo, tem a mesma virtude. E sendo caso que huma pessoa esteja ja tocada destes males do ar, de paralysia, ou de outras grandes enfermidades, não ha remedio melhor que tomar duas pingas deste oleo. Untando com elle as ventas, fontes da cabeça, & ajūta do cachaço tira logo os ditos males, & se cobra o entendimento, & movimento como dantes. Deytadas humas pingas deste oleo sobre as brazas, & tomar este fumo pelos narizes, livra aos que estaõ jà tocados do dito mal.

Tomadas algumas pingas deste oleo em agua de salsa, alimpa a via das ourinas, como de pedra, & outras immundicias.

Sara os membros encolhidos, as veas, & membros apoderados da cambra, untando-os com este oleo, misturando alguns unguentos pertencentes a isso.

Hum escropulo, ou meyo deste oleo, tomado em agua de artemisia, applica o parto às prenhadas.

Tambem cura os corrimentos frios da cabeça, & alenta as ourinas.

Untando com este oleo as ventas, & o coração, tira as grandes dores da madre; como tambem feytos huns bolinhos de açucar misturado com este oleo, & tomado algumas vezes.

Tambem he bom para grandes fraquezas, & ancias do coração.

Naõ fortifica só as forças do coração, senaõ tambem as aguas, & o figado, & tem gran-des forças para fazer degerir o comer do estomago.

Tomadas tres pingas deste oleo em agua de cardo santo, logo pouco antes que dè o pa-roxismo, ou antes que queyrão vir as maleytas, & suando muyto bem sobre isto, sara, & as tira logo.

He bom para catarro, & corrimentos.

He bom para dor de dentes causadas de corrimentos, tomado em agua de tanchagem, & gargarejando com elle.

He bom para tericia, tomado em agua cozida com folhas de morangos, ou com raiz de grama.

He bom para a colica, tomado hum escropulo, ou meyo em caldo de gallinha.

Para dores da madre, tomadas sete, ou oyto pingas em agua de erva cidreyra, ou de flor de laranja.

Para fazer deytar as pareas, quando naõ querem sahir, tomar sete, ou oyto pingas em agua de artemisia, ou de sabina.

Para o menstruo que naõ quer vir, tomar sete, ou oyto pingas em agua de erva cidrey-ra, ou em agua cozida com artemisia, ou com erva montaa.

Serve para os que cospem, ou vomitão sangue, tomado tres pingas em agua cozida com folhas de salsa bem pizada.

Serve aos que lhes foge o lume dos olhos, & ficão como atordoados; & tira o empacha-mento das aguas.

Fortifica muyto a vista, tomando por muytos dias em jejum huma chicara de agua co-zida a fogo lento com meya onça de raizes de valeriana, deytando quatro pingas do dito oleo em cada chicara da dita agua. A quantidade que se da por cada vez deste oleo, he de quatro, seis, sete, ou dez gottas, conforme a comprexão, & forças do doente.

Estes saõ os remedios, que mais ordinariamente nos mandão da India, & de outras ter-ras do mundo, & de que temos algumas noticias; mas porque todas saõ em confuso, & pouco seguras, trabalhey por examinar os verdadeyros prestimos dos ditos simplices, para que com melhor segurança pudessemos usar delles; queyra Deos que os effeytos sejão tam bons, como he o desejo que tenho do geral aproveytamento.

--- END CHUNK 20 ---

--- START CHUNK 21 ---

## Ponta da Abada, & suas virtudes.

Serve o pó desta ponta tomado em quantidade de meya oytava para matar lombrigas, com tal condição, que se tome cinco dias em jejum desfeyto com agua cozida de gra-ma, ou co decoço: a agua em que esta ponta estiver metida hum quarto de hora, bebida alegra o coração, & modera a sede: para esquinencias, & para as parotidas, he grande re-medio untar as taes partes com o polme que se fizer com esta ponta, repetindo esta diligen. cia muytos dias: os que padecem palpitações de coração, conhecem grande alivio beben-do a agua que estiver hum quarto de hora dentro de hum copo da ponta da Abada.

## Raiz da Minhaminha, ou Quiminha, & suas virtudes.

Tem esta raiz taõ presétanea virtude cóntra veneno, que iguala, ou excede ao páo Co-bra, o que experimétou hum Cirurgião estrangeiro, chamado Monsieur Estruque: deo rosalgar a duas gallinhas, & depois que tiverão o rosalgar no estomago, cahirão como mortas, & dando a hũa dellas a Minhaminha misturada com agua, & dando à outra o páo Cobra com animo de experimentar qual destas raizes tinha mais virtude contra o veneno, observou que ambas escaparão da morte.

Outro Cirurgião Flamengo, chamado Alexandre, quiz examinar a virtude da Minha-minha, & para isso deo hũ pouco de solimão a hum cachorro, & depois de cahido deo a be-ber ao cão a agua em que tinha sulado a Minhaminha, & se levantou, como se naõ tivera tomado a tal peçonha. Esta arvore nasce nas partes da Embaça, he huma mata pequena, que nao faz tronco; mas cria humas vergontinhas delgadas que nascem da raiz, do com-primento de hum covado pouco mais, ou menos; a folha he pequena, & faz tres pontas: tem esta saiz hũa qualidade taõ rara, que se com ella se misturarem outras raizes ficão sem força, nem virtude alguma, porque a Minhaminha lha chupa toda, & por isto lhe chamão Minhaminha, porque na lingua de Angola Minhaminha, quer dizer engole, porque en-gole a virtude das outras; ou porque engole o veneno que acha no estomago, & o faz dey-tar fóra, & se o naõ acha, naõ faz mal.

## Raiz de Mutututu, & suas virtudes.

Nas terras de Angola ha humas arvores a que os Gentios chamão Mutututu, saõ as di-tas arvores muyto parecidas com o nosso Medronheyro, assim nas folhas, como nos frutos, sem embargo que os taes frutos, nem se comem, nem tem gosto; porèm a raiz des-ta arvore tem grandissima virtude para erysipelas, & inflammações dos testiculos, & de outras partes: sulada em pedra com agua ordinaria até fazer polme, & applicado mor-no sobre a erysipela, & parte inflammada, ou dolorosa, lhe faz grandissimo proveyto, com tal condição, q́ naõ se deyxe secar o dito polme, antes continue o dito remedio em quanto a doença o pedir: muytos usão deste polme para moderar as dores de gotta quente: do polme sobredito se fazem ajudas maravilhosas para as camaras de sangue, ou outras muyto quentes.

## Bucho da Ema, & suas virtudes.

Nos matos do Maranhão, & no grão Pará se crião, & vivem humas aves, a que chamão Ema, nem a grandeza he mayor que o mayor Perum: a tunica, ou membra-na interior do bucho desta Ave tem grande virtude para confortar o estomago, & desfa-zer a pedra da bexiga, & fazer ourinar, dando huma oytava do tal bucho feyto em pó, mis-turado com meyo quartilho de vinho do Rhim, ou em meyo quartilho de agua cozida com meya onça de Virga aurea, ou de Eroca marinha, ou de cerfolio; mas he necessario que o doente tenha primeyro que tudo tomado hum vomitorio de seis grãos de Tartaro emeti-co, ou de meya oytava de caparrosa branca, & se tenha sangrado nos braços nove vezes dentro de tres dias: os que com esta precisa preparação derem este remedio, conseguirão maravilhosos proveyto nas suppressoens da ourina.

--- END CHUNK 21 ---

--- START CHUNK 22 ---

## Páo do Mubamgo, & suas virtudes.

Mubamgo he huma arvore agreste, cuja casca he branca, a folha de huma parte he branca, & de outra verde como a folha do alemo, he compridinha, & quasi de tres dedos de largo, cheyra este páo muyto, jà quando está florido, & alguem entra pelo ma-to onde está a dita arvore, deyta de si hum cheyro deliciosissimo: o páo desta arvore he branco; a raiz roçada de sorte que faça hum polme, tem grande prestimo para as partes pa-raliticas offendidas do ar, untando as com elle quente, bebendo tambem deste polme cousa de meya colher; tambem se dá a beber aos que tem camaras de frio, & se deytão ajudas delle para o mesmo intento. Feyta esta raiz em pó, & tomada como tabaco faz espirrar tanto, ou mais que a sevadi-lha, & usado deste modo aproveyta muyto às mulheres, quando estão assaltadas com os ac-cidentes da madre. Este páo naõ falta no mato da Embaça, de Casange, & em outras partes.

## Linguas de São Paulo, & suas virtudes.

Estas pedras, que verdadeyramente tem o feytio de huma lingua de passaro, & saõ par-das de cor de azeytona de Elvas, achão-se nas terras de Malta, tem grande virtude contra as febres malignas, & quaesquer outras, porque feytas em pó subtilissimo miti-gão muyto o demasiado calor das febres, alivião as ancias, & algumas vezes provocão suor; attribuem lhe muytas pessoas grande virtude contra o veneno, porque consta de algũas experiencias, que dando-se veneno em certa iguaria de que comerão quatro pessoas, esti-verão todas quasi mortas, & acodindo lhe com o pó destas pedras, escaparão: o que eu pos-so certificar como testemunha de vista, he, que estádo hua mulher ungida por occasião de hũa febre malignissima, taõ vizinha da morte, & taõ desacordada, que deytando se lhe ven-tosas sarjadas cõ golpes bẽ profúdos, naõ as sentio; neste aperto lhe dey o meu cordeal, a que ajūtey o pó de duas linguas destas, lhe mandey de minha casa, & no mesmo dia escapou da morte. Esta mulher estava em casa de seu cunhado Manoel Pereyra, morador à Boa Vista, jūto ao pateo das galegas. Estas pedras se achão tambén na praya de Casondama no Reyno de Angola: tambem se achão outras pedras na mesma praya redondas do tamanho dos grãos de bico de Portugal, estas saõ pretas, como saõ as pedras da cobra de Dio, & tem a mesma virtude que as de Dio, porque postas sobre as mordeduras de qualquer bicho venenoso chupão em si o veneno: chamão-se estas taes pedras, Olho de vibora.

## Páo Quifeco, & suas virtudes.

Do Reyno de Benguela vem hum páo, chamado Quifeco, o polme deste pao appli-cado sobre a testa abranda muyto as dores de cabeça: a mesma virtude tem o páo cha-mado Quicongo.

## Erva Quitumbata, & suas virtudes.

A Raiz desta erva tem virtude taõ efficaz para suspender as camaras, que havendo al-guns doentes que as tiverão cinco, & seis meses, sem haver remedio com que se es-tancassem, só com o pó desta raiz tomado huma, ou duas vezes paràrão de sorte que foy ne-cessario deytar lhe ajudas para cursarem: o modo com que se usa desta raiz he sulando-a em huma pedra com agua até fazer polme de mediana grossura, & entao se dà hũa colher deste polme misturado com Matete frio. Esta erva he muyto conhecida naquellas terras, & ha tanta abundancia della, q́ a comem os porcos, he alastrada pelo chão, a sua folha he peque-na, & redonda, deyta huma flor pequena, & branca.

## Orelha de Onça, & suas virtudes.

Na Bahia em huma terra chamada Cachoeyra nasce huma erva, a que os Naturaes chamão Orelha de Onça, a raiz desta erva he cheya de nós, como he a raiz do Сypò, com differença, que os nós saõ mayores, & mais grossos que os do Cypò: certificarão-me algumas pessoas dignas de credito, q́ a tal raiz, Orelha de Onça, tem grandissima virtu-de para soccorrer aos tossigosos, & impiematicos, com tal condição, que se tome muytos dias feyta em pó subtilissimo, misturada com duas onças de assucar rosado velho, ou com cremor da cevada.


### Peço muyto aos Leytores que yrão ponderar as seguintes razões com ani-mo desapayxonado, porque entendo darão sentença a meu favor.

He costume muyto usado na Corte de París, & em outras Cortes, & Cidades do mů-do, que todas as pessoas que sabem algum remedio efficaz para curar alguma doen-ça rebelde, mandão fixar varios papeis nas partes mais publicas das Cidades, dando nel-les noticia, que fulano morador em tal rua tem este, ou aquelle remedio para curar tal, ou tal doença, & naõ contentes com esta diligencia repartem os ditos papeis com as pessoas que encontrão pelas ruas, pertendendo deste modo que em poucos dias saibão todos aonde pódem achar soccorro para as doenças taõ teymosas, que se naõ rendem aos remedios ordinarios.

Este arbitrio taõ proveytoſo para o bem commum desejey muytas vezes pôr em exe-cução, & dar noticia dos particulares remedios, que com incansavel estudo alcancey no discurso de muytos annos, para que os doentes se aproveytassem delles; reprimi porèm o tal desejo até este tempo, por saber que nelle se naõ faz obra alguma, por boa que seja, que a malicia, & o amargoso fel da enveja naõ converta em veneno, julgando-a sinis-tramente: agora porèm que nem as detracções, nem os varios juizos, que se haõ de fazer sobre o meu designio, poderãó encender em mim o fogo da colera, porque naõ tenho mais que cinzas a que me reduzirão os meus annos, me resolvo a manifestar ao mundo que eu preparo doze remedios, com que tenho livrado da morte a muytos doentes, que estavaõ deyxados ao arbitrio da fortuna; & porque me consta que muytas pessoas padecem doen-ças, que ou tirão a vida, ou durão muytos annos, que se puderão curar, se tivessem noti-cia que em minha casa tenho para ellas remedios, quero apontallos aqui, para que os Se-nhores Medicos, com quem puder máis o amor Divino, que a desaffeyçaõ humana, ulem delles, quando as medicinas ordinarias naõ aproveytarem.

As doenças para quem servem os taes remedios, Saõ as seguintes.

Para alporcas, para febres malignas, ou bexigas, para gotta coral, para fluxos de san-gue, para suppressoens altas da ourina, para cezões intermittentes, para accidentes u-terinos, para almorreymas, para seccar o leyte, para vágados, para lombrigas; & finalme-te preparo huma massa, chamada Curviana, de grande virtude para as doenças abayxo de-claradas.

E começando pelo remedio das lombrigas, digo, que rarissimas vezes deyxa de deytar fóra toda a bicharia, que ouver no corpo, tomando dous escropulos do dito remedio tres dias successivos, ou em substancia, ou em infusão de duas onças de agua commua.

A massa Curviana se dà em fórma de pilulas em quantidade de huma oytava. Provoca efficazmente a conjunçaõ mensal, com tal condiçaõ, que se tome doze dias alternados, be-bendo lhe, passadas duas horas, meyo quartilho de caldo de grãos pardos, temperado com dez reis de açafrão, & doze grãos de pó de semente de salsa, ou meyo quartilho de agua cozida com erva montaa.

A dita massa desopila muyto as veas, com condição, que a cada dous escropulos della a-juntem hum escropulo de crocus martis aperitivo, & se continue quinze dias.

A dita massa alivia muyto aos asthmaticos, com tal condiçaõ que passadas duas horas, beba o doente huma chichara de agua bem quente, cozida com cabeças da erva hyssopo; ou tres onças de agua chamada de mil flores destillada em Mayo: toma-se seis vezes em dias alternados.

Alimpa o estomago de cruezas, & humores viscosos, & se toma quatro vezes em dias al-ternados.

Cura melhor que algum outro remedio as durezas, & opilações do baço, os caro-ços dos peytos das mulheres, & as alporcas, com tanto que se tomem da tal massa quatro escropulos, tegundo a ordem, que ensino na Polyanthea trat. 3. cap. 4. fol. 857.

Para as dores de cabeça que procederem por causa do estomago, como muytas vezes procedem, obra a dita massa maravilhosos proveyto, com tanto que se tome cinco vezes em dias alternados, bebendo lhe em sima quatro onças de agua cozida com folhas de cardo santo.

Os que quizerem saber se os sobreditos remedios saõ taõ proveytoſos como eu o digo, pódem informar se das mesmas pessoas a qué curey com elles, & ficarão desenganados, que na inculca que faço delles, tem mais parte a compayxão dos males alheyos, que o desvane-cimento, ou ambiçaõ da fama propria.

Os doentes que curey de alporcas antigas, se acharáõ nomeados no livro das minhas Observações, Obs. 7. fol. 53.

Os que curey de tebres malignas com o meu Bezoartico Curviano, sendo chamado pa-ra muytos delles depois de estarem ungidos, acharáõ nomeados na Polyanth. trat. 2. cap. 105. fol. 654 até 663.

Os que curey de accidentes de gotta coral, em que entrou hum que os tinha heredita-rios, se acharáõ nomeados na Polyanth. trat. 2. cap. 9. fol. 08. até 81.

Os que curey de fluxos de sangue se acharão nomeados no trat. 3. cap. 4. fol. 854. até 856.

Os que curey de suppressoens altas da ourina, se acharão no dito livro cap. 81. fol. 509. num. 36.

Aos Senhores Medicos, a que parecer que fiz serviço à Republica em lhe dar noticia de alguns remedios secretos, de que os doentes se nao aproveytavão, por lhes faltar o conhe-cimento delles, peço que yrão fazer o mesmo, dando noticia dos grandes remedios que souberem, & farão nisso huma obra de muyto merecimento para com Deos. Naõ digo que revelem a manufactura dos seus segredos, em quanto forem vivos, que tambem eu nao revelo a manufactura dos meus; mas digo que dem noticia delles para utilidade publi-ca, que isso he o que eu faço, & devem fazer todos em favor dos enfermos.

FINIS, LAUS DEO, Virginique Matri.`,
  metadata: {
    date: '1716',
    author: 'João Curvo Semedo',
    researchGoals: 'Understand the globalization of the early modern drug trade',
    additionalInfo: 'Semedo was a well-known Portuguese physician and apothecary. This text was included along with editions of his book Polyanthea Medicinal, and seems to have been a sort of advertisement.',
    title: 'Memorial de Varios Simplices',
    documentEmoji: '🍵',
    documentType: 'Pamphlet',
    genre: 'Pharmacopeia',
    placeOfPublication: 'Lisbon, Portugal',
    academicSubfield: 'History of Medicine',
    tags: ['Drugs', 'Pharmacy', 'Globalization', 'Medicine'],
    summary: 'A unique text that describes numerous drugs newly introduced into European medicine.',
    fullCitation: 'João Curvo Semedo. *Memorial de Varios Simplices.* Lisbon: circa 1714.',
        thumbnailUrl: '/demo-thumbnails/memorial.jpg'
  }
},
 
 // Native oral tradition source
{
  emoji: "🌃",
  title: "Delaware Oral Tradition of Manhattan",
  description: "Indigenous account of first European contact at Manhattan Island",
  text: `The following account of the first arrival of Europeans at York Island (now Manhattan) was related to me 
by aged and respected Delawares, Monseys, and Mahicanni (also called Mohicans or Mahicanders), around forty years ago. 
It is copied from notes and manuscripts taken on the spot.

A long time ago, when there were no people with a white skin, some Indians fishing where the sea widens 
saw something remarkably large floating on the water—something they had never seen before. 
They hurried to inform others, and soon many gathered to view it. Some thought it was a huge fish, others a house.

As it moved closer, they concluded it must contain the Great Mannitto (Supreme Being) 
and resolved to prepare a sacrifice and a grand dance to receive him. 
Women cooked the best food, idols were examined and cleaned, and conjurors worked to determine its meaning. 
All were in confusion—dancing, hoping, and fearing.

New runners came: it was a large house of many colors, full of creatures, unlike any they’d seen. 
One wore red and shone with strange lace—this must be the Mannitto. 
The ship hailed them in an unknown tongue. Many wanted to flee, but others urged them to stay to avoid offending the visitors.

A small canoe landed, carrying the red-clothed man and two others. 
He approached the chiefs, greeted them with a friendly face, and they returned the greeting. 
They were astonished by his skin, his dress, and especially the red garment.

A large hockhack (bottle) was produced, and a glass was poured and handed to the Mannitto, 
who drank, then offered it to the nearest chief. Each smelled it and passed it on. 
Finally, one warrior, fearing offense, stood up and drank it. He fell unconscious—believed dead— 
but awoke joyous, wanting more. Soon all joined him, and a general intoxication followed.

This is why the place is still called Mannahattanink—“the place of general intoxication.”

The next year, the vessel returned with more gifts—beads, axes, hoes, stockings. 
The Indians had worn axes as ornaments and used stockings as tobacco pouches. 
The Dutch demonstrated their use by cutting trees and digging ground. The Indians laughed at their past ignorance.

The Dutch asked for as much land as a bullock’s hide would cover. 
The Indians agreed, and the hide was cut into a thin strip and stretched to enclose a large area. 
Amazed by the cunning but not wishing to quarrel, they allowed it. 
But the whites returned, asking for more and more land—until, as they say, they wanted it all.

[End of relation.]`,
  metadata: {
    date: 'January 26, 1801',
    author: 'John Heckewelder (retold by)',
    researchGoals: 'Understand Indigenous oral traditions about first contact with Europeans in the Northeast',
    additionalInfo: 'Original manuscript sent by Heckewelder to Rev. Samuel Miller; included in the 1819 publication by the American Philosophical Society, though altered from the original.',
    title: 'Indian Tradition of the First Arrival of the Dutch at Manhattan Island',
    documentEmoji: '🪶',
    documentType: 'Oral History',
    genre: 'Early Ethnography',
    placeOfPublication: 'Bethlehem, Pennsylvania',
    academicSubfield: 'Early American History / Indigenous Studies',
    tags: ['First Contact', 'Dutch Colonization', 'Lenape History', 'Oral Tradition', 'Manhattan'],
    summary: 'Native account of the Dutch arrival in what later became New York City.',
    fullCitation: 'Heckewelder, John. “Indian Tradition of the First Arrival of the Dutch at Manhattan Island.” Communicated to Rev. Samuel Miller, 1801. Later printed in American Philosophical Society Transactions, 1819.',
        thumbnailUrl: '/demo-thumbnails/manhattan.jpg'
  }
},
 

    {
    emoji: "🎩",
    title: "Gettysburg Address",
     description: "Lincoln's famous Civil War speech dedicating a cemetery for fallen soldiers",
    text: `“Four score and seven years ago our fathers brought forth on this continent a new nation, conceived in liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. 
    We are met on a great battlefield of that war. We have come to dedicate a portion of that field as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this. 
    But in a larger sense we cannot dedicate, we cannot consecrate, we cannot hallow this ground. The brave men, living and dead, who struggled here have consecrated it, far above our poor power to add or detract. The world will little note, nor long remember, what we say here, but it can never forget what they did here. It is for us the living, rather, to be dedicated here to the unfinished work which they who fought here have thus far so nobly advanced. It is rather for us to be here dedicated to the great task remaining before us,that from these honored dead we take increased devotion to that cause for which they gave the last full measure of devotion, that we here highly resolve that these dead shall not have died in vain, that this nation, under God, shall have a new birth of freedom, and that government of the people, by the people, for the people, shall not perish from the earth.`,
    metadata: {
      date: '1863',
      author: 'Abraham Lincoln',
      researchGoals: 'Understand the historical context and in particular, who Lincoln was drawing on, referencing, and addressing himself to.',
      additionalInfo: 'Delivered during the American Civil War at the dedication of the Soldiers\' National Cemetery in Gettysburg, Pennsylvania.',
      title: 'Gettysburg Address',
      documentEmoji: '🪦',
      documentType: 'Speech',
      genre: 'Political Oratory',
      placeOfPublication: 'Gettysburg, Pennsylvania',
      academicSubfield: 'Political History',
      tags: ['Civil War', 'American History', 'Presidential Speech'],
      summary: 'A concise dedication honoring Union soldiers.',
      thumbnailUrl: '/demo-thumbnails/gettysburg.jpg'
    }
  },

  // Philosophical experience report - 19th century consciousness studies
{
  emoji: "🌀",
  title: "William James's Nitrous Oxide Trip",
  description: "William James’s 1882 philosophical reflections under nitrous oxide intoxication",
  text: `# Subjective Effects of Nitrous Oxide


Some observations of the effects of nitrous-oxide-gas-intoxication which I was prompted to make by reading the pamphlet called *The Anaesthetic Revelation and the Gist of Philosophy* (Blood, 1874), have made me understand better than ever before both the strength and the weakness of Hegel's philosophy. I strongly urge others to repeat the experiment, which with pure gas is short and harmless enough. The effects will of course vary with the individual, just as they vary in the same individual from time to time; but it is probable that in the former case, as in the latter, a generic resemblance will obtain. 

With me, as with every other person of whom I have heard, the keynote of the experience is the tremendously exciting sense of an intense metaphysical illumination. Truth lies open to the view in depth beneath depth of almost blinding evidence. The mind sees all the logical relations of being with an apparent subtlety and instantaneity to which its normal consciousness offers no parallel; only as sobriety returns, the feeling of insight fades, and one is left staring vacantly at a few disjointed words and phrases, as one stares at the cadaverous-looking snow peak from which the sunset glow has just fled, or at the black cinder left by an extinguished brand.

The immense emotional sense of reconciliation which characterizes the "maudlin" stage of alcoholic drunkenness — a stage which seems silly to lookers-on, but the subjective rapture of which probably constitutes a chief part of the temptation to the vice — is well-known. The centre and periphery of things seem to come together. The ego and its objects, the *meum* and the *tuum*, are one. Now this, only a thousand-fold enhanced, was the effect upon me of the gas: and its first result was to make peal through me with unutterable power the conviction that Hegelism was true after all, and that the deepest convictions of my intellect hitherto were wrong.

Whatever idea of representation occurred to the mind was seized by the same logical forceps, and served to illustrate the same truth; and that truth was that every opposition, among whatsoever things, vanished in a higher unity in which it is based; that all contradictions, so-called, are of a common kind; that unbroken continuity is of the essence of being; and that we are literally in the midst of an infinite, to perceive the existence of which is the utmost we can attain. Without the same as a basis, how could strife occur? Strife presupposes something to be striven about; and in this common topic, the same of both parties, the differences merge. 

From the hardest contradiction to the tenderest diversity of verbiage, differences evaporate; yes and no agree at least in being assertions; a denial of a statement is but another mode of stating the same. Contradiction can only occur of the same thing — all opinions are thus synonyms, and synonymous, are the same. But the same phrase by difference of emphasis is two; and here again difference and no-difference merge in one.

It is impossible to convey an idea of the torrential character of the identification of opposites as it streams through the mind in this experience. I have sheet after sheet of phrases dictated or written during the intoxication, which to the sober reader seem meaningless drivel, but which at the moment of transcribing were fused in the fire of infinite rationality.

God and devil, good and evil, life and death, I and thou, sober and drunk, matter and form, black and white, quantity and quality, shiver of ecstasy and shudder of horror, vomiting and swallowing, inspiration and expiration, fate and reason, great and small, extent and intent, joke and earnest, tragic and comic — and fifty other contrasts figure in these pages in the same monotonous way. 

The mind saw how each term belonged to its contrast through a knife-edge moment of transition which it effected, and which, perennial and eternal, was the *nunc stans* of life. The thought of mutual implication of the parts in the bare form of a judgment of opposition — as "nothing—but," "no more—than," "only—if," etc. — produced a perfect delirium of the theoretic rapture. And at last, when definite ideas to work on came slowly, the mind went through the mere form of recognizing sameness in identity by contrasting the same word with itself, differently emphasized, or shorn of its initial letter. Let me transcribe a few sentences:

- "What's mistake but a kind of take?"  
- "What's nausea but a kind of -usea?"  
- "Sober, drunk, -unk, astonishment."  
- "Everything can become the subject of criticism —  
- How criticize without something to criticize?"  
- "Agreement — disagreement!!"  
- "Emotion — motion!!!!"  
- "By God, how that hurts! By God, how it **doesn’t** hurt!"  
- "Reconciliation of two extremes."  
- "By George, nothing but *othing*!"  
- "That sounds like nonsense, but it is pure *on*sense!"  
- "Thought deeper than speech...!"  
- "Medical school; divinity school, *school*! **SCHOOL**!"  
- "Oh my God, oh God; oh God!" 

The most coherent and articulate sentence which came was this:  

"**There are no differences but differences of degree between different degrees of difference and no difference.**"

But now comes the reverse of the medal. What is the principle of unity in all this monotonous rain of instances? Although I did not see it at first, I soon found that it was in each case nothing but the abstract genus of which the conflicting terms were opposite species. In other words, although the flood of ontologic emotion was Hegelian through and through, the ground for it was nothing but the world-old principle that things are the same only so far and not farther than they are the same, or partake of a common nature — the principle that Hegel most tramples under foot.

At the same time the rapture of beholding a process that was infinite, changed (as the nature of the infinitude was realized by the mind) into the sense of a dreadful and ineluctable fate, with whose magnitude every finite effort is incommensurable and in the light of which whatever happens is indifferent. This instantaneous revulsion of mood from rapture to horror is, perhaps, the strongest emotion I have ever experienced. I got it repeatedly when the inhalation was continued long enough to produce incipient nausea; and I cannot but regard it as the normal and the inevitable outcome of the intoxication, if sufficiently prolonged.

A pessimistic fatalism, depth within depth of impotence and indifference, reason and silliness united, not in a higher synthesis, but in the fact that whichever you choose it is all one — this is the upshot of a revelation that began so rosy bright.

Even when the process stops short of this ultimatum, the reader will have noticed from the phrases quoted how often it ends by losing the clue. Something "fades," "escapes"; and the feeling of insight is changed into an intense one of bewilderment, puzzle, confusion, astonishment. I know no more singular sensation than this intense bewilderment, with nothing left to be bewildered at save the bewilderment itself. It seems, indeed, a *causa sui*, or "spirit become its own object."

My conclusion is that the togetherness of things in a common world, the law of sharing, of which I have said so much, may, when perceived, engender a very powerful emotion; that Hegel was so unusually susceptible to this emotion throughout his life that its gratification became his supreme end, and made him tolerably unscrupulous as to means he employed; that indifferentism is the true outcome of every view of the world which makes infinity and continuity to be its essence; and that pessimistic or optimistic attitudes pertain to the mere accidental subjectivity of the moment. Finally, that the identification of contradictories, so far from being the self-developing process which Hegel supposes, is really a self-consuming process, passing from the less to the more abstract, and terminating either in a laugh at the ultimate nothingness, or in a mood of vertiginous amazement at a meaningless infinity.`,
  metadata: {
    date: '1882',
    author: 'William James',
    researchGoals: 'Explore consciousness, metaphysical insight, and philosophical implications of anesthetic states',
    additionalInfo: 'Originally inspired by Benjamin Paul Blood’s 1874 pamphlet *The Anaesthetic Revelation and the Gist of Philosophy*.',
    title: 'Some Observations of Nitrous-Oxide-Gas-Intoxication',
    documentEmoji: '🌀',
    documentType: 'Journal Article',
    genre: 'Trip Report',
    placeOfPublication: 'Oxford, England',
    academicSubfield: 'Philosophy of Mind / Psychology of Mysticism',
    tags: ['William James', 'Nitrous Oxide', 'Altered States', 'Metaphysics', 'Hegel', 'Consciousness Studies'],
    summary: 'James’s account of the euphoria and horror induced by nitrous oxide... and Hegel.',
    fullCitation: 'William James. "The Subjective Effects of Nitrous Oxide." *Mind*, Vol. 7, No. 27 (Jul. 1882), pp. 186–208.',
        thumbnailUrl: '/demo-thumbnails/nitrous.jpg'
  }
},

  // Medical text - 19th century pharmacology
{
  emoji: "🧪",
  title: "Über Coca",
  description: "1885 treatise by Sigmund Freud on the coca plant and its alkaloid, cocaine",
  text: `Über Coca  
Von Dr. Sigmund Freud, Sekundararzt im k. k. Allgemeinen Krankenhause in Wien.  
Neu durchgesehener und vermehrter Separatabdruck aus dem „Centralblatt für die gesamte Therapie“.  
WIEN, 1885. Verlag von Moritz Perles, Wien, Stadt, Bauernmarkt Nr. 11.

I. Die Cocapflanze.  
Die Cocapflanze, *Erythroxylon coca*, ist ein 4–6 Fuß hoher, unserem Schwarzdorn ähnlicher Strauch,  
der in Südamerika, insbesondere in Peru und Bolivia, in großem Umfange angebaut wird.  
Er gedeiht am besten in den warmen Tälern am Ostabhang der Anden, 5000–6000 Fuß über dem Meeresspiegel,  
in einem regenreichen, von Temperaturextremen freien Klima.

Die Blätter, welche etwa 10 Millionen Menschen als unentbehrliches Genussmittel dienen,  
sind eirund, 5–6 cm lang, gestielt, ganzrandig, bereift,  
durch zwei besonders an der unteren Fläche hervortretende, linienförmige Falten ausgezeichnet.  
Der Strauch trägt kleine weiße Blüten zu zweit oder dritt in seitlichen Büscheln und eiförmige rote Früchte.

Ein Cocastrauch gibt unter günstigen Verhältnissen 4–5 Blätterernten jährlich  
und bleibt 30–40 Jahre ertragsfähig.  
Bei der großen Produktion (angeblich 30 Millionen Pfund jährlich)  
sind die Cocablätter für diese Länder ein wichtiges Handels- und Steuerobjekt.

II. Geschichte und Verwendung im Lande.  
Die spanischen Eroberer fanden die Cocapflanze im Lande kultiviert und in hohem Ansehen,  
ja selbst in innige Beziehungen zu religiösen Gebräuchen gebracht.  
Die Sage erzählte, dass Manco Capac, der göttliche Sohn der Sonne,  
vom Titicacasee herabstieg, das Licht brachte und Coca schenkte –  
die Pflanze, „welche den Hungrigen sättigt, den Schwachen stärkt und sie ihr Missgeschick vergessen lässt“.

Cocablätter wurden Göttern geopfert, Toten in den Mund gesteckt,  
während der gottesdienstlichen Handlungen gekaut.  
Die Spanier sahen Coca zuerst als Teufelswerk und ein Konzil zu Lima verbot ihren Genuss.  
Aber als sie merkten, dass Indianer ohne Coca keine Arbeit in den Minen leisten konnten,  
begannen sie, Blätter auszuteilen – bis heute ein zentraler Bestandteil des Lebens.

Der Indianer trägt stets einen Beutel mit Cocablättern (chuspa) und eine Flasche mit Asche (llieta).  
Er formt aus den Blättern einen Bissen (acullico), durchbohrt ihn mit einem Stachel,  
taucht diesen in die Asche und kaut langsam mit reichlicher Speichelabsonderung.

III. Die Cocablätter in Europa – Das Cocain.  
Die älteste Empfehlung stammt von Monardes (Sevilla, 1569),  
später gefolgt von Berichten aus Lima, die die Wirkung gegen Hunger und Ermüdung lobten.  
1749 kam die Pflanze nach Europa, wurde von de Jussieu beschrieben  
und schließlich als *Erythroxylon coca* klassifiziert.

1859 isolierte Niemann aus Cocablättern ein Alkaloid – Cocain.  
Es kristallisiert in farblosen Prismen, schmeckt bitterlich,  
ruft Anästhesie hervor, schmilzt bei 98 °C, ist schwer wasserlöslich,  
bildet Doppelsalze mit Platin- und Goldchlorid.

Beim Erhitzen mit Salzsäure zerfällt es in Benzoesäure, Methylalkohol und Ecgonin.  
Lossen stellte die Formel C₁₇H₂₁NO₄ auf.  
Cocainsalze eignen sich wegen ihrer Löslichkeit besonders gut zur therapeutischen Anwendung.

Weitere Bestandteile der Cocablätter: Cocagerbsäure, ein eigentümliches Wachs,  
und das Hygrin – eine flüchtige Base mit trimethylaminähnlichem Geruch.

IV. Die Cocawirkung beim gesunden Menschen.  
Ich habe die Wirkung des Cocains an mir und anderen untersucht.  
0,05 g Cocain muriaticum in 1%iger Lösung führte bei mir zu  
„plötzlicher Aufheiterung und einem Gefühl von Leichtigkeit“,  
Pelzigkeit an Lippen und Gaumen, Wärmegefühl,  
manchmal Gähnen, vertiefte Atemzüge und Euphorie.

Die Stimmung ähnelt der normalen Gesundheitseuphorie –  
ohne alkoholisches Alterationsgefühl, kein Drang zur Betätigung,  
aber gesteigerte Selbstbeherrschung, geistige Ausdauer,  
und Aufhebung von Müdigkeit, Hunger und Schlafbedürfnis.

Ich habe diese Wirkung etwa ein Dutzend Mal beobachtet.  
Ein Kollege, nach einem langen Arbeitstag nüchtern,  
nahm 0,05 g Cocain und erklärte kurz darauf,  
er fühle sich „wie nach einem üppigen Mahl“ –  
wollte nicht essen, fühlte sich gestärkt für einen weiten Weg.

Diese Cocainwirkung zeigt sich regelmäßig bei geeigneter Dosis.  
Sie erklärt die Hochachtung, welche Coca bei südamerikanischen Völkern genießt,  
und rechtfertigt ihre weitere medizinische Untersuchung.`,
  metadata: {
    date: '1885',
    author: 'Sigmund Freud',
    researchGoals: 'Document and analyze Freud’s early scientific writings on psychoactive substances',
    additionalInfo: 'This is a large excerpt from Freud’s original 1885 pamphlet *Über Coca*, including botanical, historical, and experimental sections.',
    title: 'Über Coca',
    documentEmoji: '🧪',
    documentType: 'Scientific Pamphlet',
    genre: 'Medical Treatise',
    placeOfPublication: 'Vienna, Austria',
    academicSubfield: 'History of Medicine / Psychoanalysis',
    tags: ['Freud', 'Coca', 'Cocaine', '19th Century Medicine', 'Experimental Pharmacology'],
    summary: 'Freud’s account of coca leaf use, its chemistry, history, and his personal trials with cocaine.',
    fullCitation: 'Freud, Sigmund. *Über Coca*. Vienna: Verlag von Moritz Perles, 1885.',
      thumbnailUrl: '/demo-thumbnails/coca.jpg'
  }
},
  // 20th century letter
  {
    emoji: "💌",
    title: "Virginia Woolf letter",
    description: "Intimate 1927 letter from Virginia Woolf to Vita Sackville-West discussing her novel Orlando",
    text: `Friday, October 13, 1927

…I’m so engulfed in Orlando I can think of nothing else …. Tomorrow I begin the chapter which describes Violet and you meeting on the ice ….  I am swarming with ideas. Do give me some inkling what sort of quarrels you had. Also, for what particular quality did she first choose you? Look here: I must come down and see you ….(I think of nothing but you all day long, in different guises, and Violet and the ice and Elizabeth and George the 3rd) ….

Orlando will be a little book, with pictures and a map or two. I make it up in bed at night, as I walk the streets, everywhere. I want to see you in lamplight, in your emeralds. In fact, I have never more wanted to see you than I do now—just to sit and look at you, and get you to talk, and then rapidly and secretly, correct certain doubtful points. About your teeth now and your temper. Is it true you grind your teeth at night? Is it, true that you love giving me pain? What and when was your moment of greatest disillusionment? …

 If you’ve given yourself to Campbell, I’ll have no more to do with you, and so it shall be written, plainly, for all the world to red in in Orlando. Tell me if you will come and when…

Dearest Mrs. Nicholson, Goodnight`,
    metadata: {
     date: 'October 13, 1927',
      author: 'Virginia Woolf',
      researchGoals: 'Understand sexuality, gender, and art in the early 20th century.',
      additionalInfo: 'Sent from Woolf to Vita Sackville-West, who was the inspiration for Woolf\'s novel Orlando.',
      title: 'Letter to Vita Sackville-West',
      documentEmoji: '💌',
      documentType: 'Personal Letter',
      genre: 'Literary Correspondence',
      placeOfPublication: 'London, England',
      academicSubfield: 'Modernist Literary Studies',
      tags: ['Bloomsbury Group', 'LGBTQ+ History', 'Literary Modernism'],
      summary: 'Intimate correspondence about writing Orlando, sent to her lover Vita.',
       thumbnailUrl: '/demo-thumbnails/woolfletter.jpg'
    }
  },
  // Anthropological field notes - Balinese puppet making
{
  emoji: "🌏",
  title: "Margaret Mead's Bali Notes",
  description: "Margaret Mead and her Balinese secretary Madé Kalér’s field notes on Balinese shadow puppet craft and artisanship",
  text: `Kesoesrat: Nov. 5, 1937  
NEGARI.  
Batoe, Nov. 4, 1937  

DI IWARNE, TOEKANG WAJANG DI NEGARI:—  

10.46 "Pengoetik alih," keta I Wara ngomong teken adinne noemni.  
Abangaa patjek teken anak loeh.  
I Wara: "Boetin besik koenengan."  
Anak loeh: "Pakoe ada,"  
I Wara: "Pakoe kene ada noe."  

11.07 I Wara teken adinne ngomong: "tingting ko Batoeh."  
11.22 I Wara lakar nganglasin wajang.  
"Amplasan djemoes kang amplas mo."  

I Wara ngorahang wajang ane koena toesing ngangon perada,  
noemlenang lantas injemak wajang ane toesingemperedada:  
"Endang djamak kajoe-kajoeane."

**Perabot-perabot wajang ane keanggoen baan I Wara:**  
1. pengoetik  
2. antjoek  
3. patjek  
4. kothak wajang  
5. keoe misi ranggi  
6. sanjtji  
7. patj penggoep blomoe  
8. pengoët (semèt, sloosen)  
9. gegelik (dadoenan toek di semèt, tempékan)  
10. penoelian pengoetengan baan tiling  
11. kikir poetik  
12. patj pengrantjang  
13. patj poesoeboek  
14. keoe misi kentjoes  
15. poesoet  
16. kikir - 4  
17. penoelian pemolasan  
18. don amplas

**Definitions:**  
Pengoetik – anggon ngangsoed (ngodot beloelang di ngantiang ngoréhne)  
Poesoet – anggon masang tali  
Kikir – anggon menang pante di oesak-oesakne  

———  

**Field Note II – Mead, Negara, Nov. 4, 1937**  
Visit One, August 12.  
We found I Wara through Colin, who said he was particularly good and bought  
a very elegant Ardjoene for us as a present, to show how wajangs really should be made.  

Actually this Ardjoene, which I Wara calls "number setoe," is so thin it could never be used—  
a fragile style developed for sale.  

I Wara took us to a deserted *pekarangan* where the *gedong* of wajangs were kept.  
He didn’t know where the key was—sent a child to ask his father in the fields.  

His grandfather was a *dalang*. His father sold the *dalang box* to pay for a *seboen*.  
I Wara is not a real *dalang* but is rebuilding a box, collecting *mals* from Klengklengker.  

He is a professional wajang maker for shops in Badsoe.  
He works fast under deadline and distinguishes between:  
— no.1 (fragile display)  
— no.2 biasa (standard)  
— no.3 for *wajan-like novelmen*.  

His box is plain—he is not yet focused on elaborate *noekir*.  
Comparable to Fernando Mode's masks: beautiful, but topeng actors didn’t use them.  

Colin later said I Wara’s wajangs were “cold and lifeless” despite once calling them the best in Bali.  

Wara is slight, eager, fey, intelligent, and adaptive.  
He asks his wife’s advice on practicalities—timeline, advance payment, etc.  

We ordered 55 guilders worth of wajangs, paid 10 as deposit, and left.  
Returned later to arrange a series of partly completed *Damas*—he understood the request perfectly.

**Visit II for Photography**  
[handwritten note] Nov. 4, 1937  
[LEICA CINE MKE TIKIT noted in margin]`,
  metadata: {
    date: '1937-11-4',
    author: 'Margaret Mead & Madé Kalér',
    researchGoals: 'Document the tools, techniques, and craft hierarchy involved in Balinese wajang (shadow puppet) making',
    additionalInfo: 'Field notes from Mead and Kalér during the 1937–38 Bali expedition. Includes ethnographic transcription and personal observations. Original manuscripts housed at the Library of Congress.',
    title: 'Notes on Wajang-Making in Negara',
    documentEmoji: '🎭',
    documentType: 'Field Notes',
    genre: 'Anthropology',
    placeOfPublication: 'Negara, Bali',
    academicSubfield: 'Cultural Anthropology / Performance Studies',
    tags: ['Margaret Mead', 'Wajang', 'Bali', 'Shadow Puppets', 'Craft Labor', 'Ethnography'],
    summary: 'Field notes from Margaret Mead and Madé Kalér’s study of Balinese wajang production.',
    fullCitation: 'Mead, Margaret & Madé Kalér. “Notes on Wajang-Making in Negara.” Field Notes, November 1937. Margaret Mead Papers, Library of Congress.',
     thumbnailUrl: '/demo-thumbnails/meadnotes.jpg'
 }
}

];

export const demoExtractConfigs: Record<number, ExtractInfoConfig> = {
  
  0: { // Ancient Complaint
    listType: "What are Nanni's specific complaints?",
    fields: [
      "Specific complaints",
      "Severity level in context of Sumerian society",
      "Relevent quote in source",
    ]
  },
   1: { // Pelbartus demon text
    listType: "Make a table of the demons and spiritual entities mentioned in this text",
    fields: [
      "Latin name for demon",
      "English translation",
      "Characteristics", 
      "Key quote in Latin (5-6 words)",
      "Translation"
    ],
    format: 'table'
  },
  2: { // Thomas Mun
    listType: "What countries does Mun mention in this source?",
    fields: [
      "What continent is the country on?",
      "What is Mun's opinion toward the country?",
      "What trade goods does he mention the country having?",
      "Specifically where in Mun's text is country mentioned?"
    ]
  },
  3: { // Spanish Inquisition
    listType: "What religious or spiritual practices and substances are mentioned?",
    fields: [
      "Name of practice or substance",
      "How is it characterized by the author in Spanish?",
      "English translation of the Spanish?",
      "Larger social context"
    ]
  },
  4: { // Virginia Woolf letter
    listType: "What literary references or metaphors does Woolf use?",
    fields: [
      "Reference or metaphor used?",
      "Emotional valence?",
      "Connection to Orlando (the novel)?",
      "Connection to Woolf's life at the time?"
    ]
  }
};