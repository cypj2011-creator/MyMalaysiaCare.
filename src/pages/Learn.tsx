import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, HelpCircle, Recycle, Trash2, Package, Battery } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Learn = () => {
  const { t } = useTranslation();
  
  const categories = [
    {
      icon: Recycle,
      title: "Recycling Basics",
      color: "text-green-500",
      bg: "bg-green-500/10",
      faqs: [
        {
          q: "What is recycling?",
          a: "Recycling is the process of converting waste materials into new products to prevent waste of potentially useful materials, reduce consumption of fresh raw materials, and decrease pollution."
        },
        {
          q: "Why is recycling important in Malaysia?",
          a: "Malaysia generates over 38,000 tons of waste daily, with only 28% being recycled. Recycling reduces landfill waste, conserves natural resources, saves energy, and reduces greenhouse gas emissions."
        },
        {
          q: "What are the main recyclable materials?",
          a: "The main recyclable materials are: Paper and cardboard, Plastic bottles and containers, Glass bottles and jars, Metal cans (aluminum and steel), and certain electronics (e-waste)."
        },
      ]
    },
    {
      icon: Package,
      title: "Plastic & Paper",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      faqs: [
        {
          q: "What types of plastic can be recycled?",
          a: "Look for recycling symbols #1 (PET) and #2 (HDPE) - these are most commonly recycled. Examples: water bottles, milk jugs, detergent bottles. Clean and dry them before recycling."
        },
        {
          q: "Can I recycle greasy pizza boxes?",
          a: "No, greasy or food-contaminated cardboard cannot be recycled as it contaminates other recyclables. Only recycle clean, dry cardboard. Compost greasy boxes if possible."
        },
        {
          q: "Should I remove plastic windows from envelopes?",
          a: "Yes! Remove plastic windows, staples, and any non-paper attachments before recycling envelopes. These contaminants can damage recycling equipment."
        },
        {
          q: "Can shredded paper be recycled?",
          a: "Yes, but place it in a paper bag or cardboard box before putting it in the recycling bin. Loose shredded paper can blow away and contaminate other recyclables."
        },
      ]
    },
    {
      icon: Battery,
      title: "E-Waste",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      faqs: [
        {
          q: "What is e-waste?",
          a: "E-waste (electronic waste) includes any discarded electrical or electronic devices: computers, phones, TVs, batteries, appliances, chargers, and more."
        },
        {
          q: "Why can't e-waste go in regular trash?",
          a: "E-waste contains hazardous materials (lead, mercury, cadmium) that can contaminate soil and water. It also contains valuable materials (gold, silver, copper) that should be recovered."
        },
        {
          q: "Where do I dispose of e-waste in Malaysia?",
          a: "Take e-waste to designated collection centers. Use our Interactive Map to find the nearest e-waste collection point. Many malls and electronic stores also have drop-off boxes."
        },
        {
          q: "Should I remove batteries from devices?",
          a: "Yes, remove batteries before recycling electronics. Batteries must be recycled separately at battery collection points as they contain different hazardous materials."
        },
      ]
    },
    {
      icon: Trash2,
      title: "Common Mistakes",
      color: "text-red-500",
      bg: "bg-red-500/10",
      faqs: [
        {
          q: "Can I recycle plastic bags?",
          a: "Most recycling programs don't accept thin plastic bags as they jam sorting machines. Instead, reuse them or bring them to supermarket collection bins. Better yet, switch to reusable bags!"
        },
        {
          q: "Do I need to rinse containers?",
          a: "Yes! Food residue contaminates entire batches of recyclables. Rinse containers with water before recycling. They don't need to be spotless, just free of major food waste."
        },
        {
          q: "Can I recycle styrofoam?",
          a: "Most curbside programs in Malaysia don't accept styrofoam. It's difficult to recycle and takes up space. Avoid styrofoam products when possible, or take to specialized recycling facilities."
        },
        {
          q: "What about broken glass?",
          a: "Wrap broken glass carefully in newspaper and dispose in regular trash for safety. Intact glass bottles and jars can be recycled. Never put broken glass in recycling bins."
        },
      ]
    },
  ];

  const quickTips = [
    "Clean, Dry, Empty: The golden rule of recycling",
    "Use our RecycAI Scanner when in doubt",
    "Flatten boxes to save space",
    "When in doubt, throw it out (contamination hurts recycling)",
    "Recycle symbols matter: Look for #1 and #2 plastics",
    "Every item recycled makes a difference",
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent break-words px-2">
          {t("learnRecycling")}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto break-words px-4">
          {t("comprehensiveGuide")}
        </p>
      </div>

      {/* Quick Tips */}
      <Card className="p-6 mb-12 shadow-custom-lg gradient-primary text-white">
        <div className="flex items-center space-x-3 mb-4">
          <HelpCircle className="w-6 h-6" />
          <h2 className="text-2xl font-bold">{t("quickTips")}</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {quickTips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-2 bg-white/10 backdrop-blur rounded-lg p-3 min-w-0">
              <span className="text-xs sm:text-sm break-words leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* FAQ Categories */}
      <div className="space-y-6">
        {categories.map((category, index) => (
          <Card key={index} className="p-6 shadow-custom-lg">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-6 min-w-0">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${category.bg} flex items-center justify-center flex-shrink-0`}>
                <category.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${category.color}`} />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold break-words leading-tight">{category.title}</h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {category.faqs.map((faq, faqIndex) => (
                <AccordionItem key={faqIndex} value={`item-${faqIndex}`}>
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold text-sm sm:text-base break-words pr-4">{faq.q}</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base break-words">{faq.a}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        ))}
      </div>

      {/* Resources */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <Card className="p-6 shadow-custom-lg">
          <BookOpen className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-3">{t("officialResources")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Ministry of Housing and Local Government (KPKT)</li>
            <li>• Department of Environment Malaysia (DoE)</li>
            <li>• Solid Waste Management Corporation (SWCorp)</li>
            <li>• Malaysian Green Technology Corporation (GreenTech)</li>
          </ul>
        </Card>

        <Card className="p-6 shadow-custom-lg gradient-secondary text-white">
          <h3 className="text-xl font-semibold mb-3">{t("tryAIScanner")}</h3>
          <p className="text-white/90 mb-4">
            {t("notSureRecyclable")}
          </p>
          <a href="/recycle">
            <button className="w-full py-3 bg-white text-secondary font-semibold rounded-lg hover:bg-white/90 transition-colors">
              {t("scanNow")}
            </button>
          </a>
        </Card>
      </div>

      {/* Recycling Symbols */}
      <Card className="p-6 mt-6 shadow-custom-md">
        <h3 className="text-xl font-semibold mb-4">{t("understandingSymbols")}</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Recycle className="w-5 h-5 text-primary" />
            </div>
            <div className="font-semibold text-sm">#1 PET</div>
            <div className="text-xs text-muted-foreground">Water bottles</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Recycle className="w-5 h-5 text-primary" />
            </div>
            <div className="font-semibold text-sm">#2 HDPE</div>
            <div className="text-xs text-muted-foreground">Milk jugs</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Recycle className="w-5 h-5 text-primary" />
            </div>
            <div className="font-semibold text-sm">#5 PP</div>
            <div className="text-xs text-muted-foreground">Yogurt containers</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
              <Package className="w-5 h-5 text-secondary" />
            </div>
            <div className="font-semibold text-sm">Paper</div>
            <div className="text-xs text-muted-foreground">Cardboard, newspaper</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Learn;
