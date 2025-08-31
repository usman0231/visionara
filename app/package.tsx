import React, { useState } from 'react'

function package_detail() {
  const packages = {
    "web_basic_onetime": {
      name: "Basic",
      price: "$500",
      features: [
        "5 Page Website",
        "Responsive Design",
        "Basic SEO",
        "Contact Form",
        "Social Media Integration"
      ]
    },
    "web_basic_monthly": {
      name: "Basic",
      price: "$50/month",
      features: [
        "5 Page Website",
        "Responsive Design",
        "Basic SEO",
        "Contact Form",
        "Social Media Integration",
        "Monthly Updates"
      ]
    },
    "web_basic_yearly": {
      name: "Basic",
      price: "$500/year",
      features: [
        "5 Page Website",
        "Responsive Design",
        "Basic SEO",
        "Contact Form",
        "Social Media Integration",
        "Yearly Updates"
      ]
    },
    "web_standard_onetime": {
      name: "Standard",
      price: "$1000",
      features: [
        "10 Page Website",
        "Responsive Design",
        "Advanced SEO",
        "Contact Form",
        "Social Media Integration",
        "Blog Setup"
      ]
    },
    "web_standard_monthly": {
      name: "Standard",
      price: "$100/month",
      features: [
        "10 Page Website",
        "Responsive Design",
        "Advanced SEO",
        "Contact Form",
        "Social Media Integration",
        "Blog Setup",
        "Monthly Updates"
      ]
    },
    "web_standard_yearly": {
      name: "Standard",
      price: "$1000/year",
      features: [
        "10 Page Website",
        "Responsive Design",
        "Advanced SEO",
        "Contact Form",
        "Social Media Integration",
        "Blog Setup",
        "Yearly Updates"
      ]
    },
    "web_enterprise_onetime": {
      name: "Enterprise",
      price: "$2000",
      features: [
        "20 Page Website",
        "Responsive Design",
        "Premium SEO",
        "Contact Form",
        "Social Media Integration",
        "Blog Setup",
        "E-commerce Functionality"
      ]
    },
    "web_enterprise_monthly": {
      name: "Enterprise",
      price: "$200/month",
      features: [
        "20 Page Website",
        "Responsive Design",
        "Premium SEO",
        "Contact Form",
        "Social Media Integration",
        "Blog Setup",
        "E-commerce Functionality",
        "Monthly Updates"
      ]
    },
    "web_enterprise_yearly": {
      name: "Enterprise",
      price: "$2000/year",
      features: [
        "20 Page Website",
        "Responsive Design",
        "Premium SEO",
        "Contact Form",
        "Social Media Integration",
        "Blog Setup",
        "E-commerce Functionality",
        "Yearly Updates"
      ]
    },
    "mobile_basic_onetime": {
      name: "Basic",
      price: "$1000",
      features: [
        "Simple App",
        "iOS & Android",
        "Basic UI/UX",
        "Push Notifications"
      ]
    },
    "mobile_basic_monthly": {
      name: "Basic",
      price: "$100/month",
      features: [
        "Simple App",
        "iOS & Android",
        "Basic UI/UX",
        "Push Notifications",
        "Monthly Updates"
      ]
    },
    "mobile_basic_yearly": {
      name: "Basic",
      price: "$1000/year",
      features: [
        "Simple App",
        "iOS & Android",
        "Basic UI/UX",
        "Push Notifications",
        "Yearly Updates"
      ]
    },
    "mobile_standard_onetime": {
      name: "Standard",
      price: "$2000",
      features: [
        "Moderate App",
        "iOS & Android",
        "Advanced UI/UX",
        "Push Notifications",
        "In-App Purchases"
      ]
    },
    "mobile_standard_monthly": {
      name: "Standard",
      price: "$200/month",
      features: [
        "Moderate App",
        "iOS & Android",
        "Advanced UI/UX",
        "Push Notifications",
        "In-App Purchases",
        "Monthly Updates"
      ]
    },
    "mobile_standard_yearly": {
      name: "Standard",
      price: "$2000/year",
      features: [
        "Moderate App",
        "iOS & Android",
        "Advanced UI/UX",
        "Push Notifications",
        "In-App Purchases",
        "Yearly Updates"
      ]
    },
    "mobile_enterprise_onetime": {
      name: "Enterprise",
      price: "$4000",
      features: [
        "Complex App",
        "iOS & Android",
        "Premium UI/UX",
        "Push Notifications",
        "In-App Purchases",
        "API Integration"
      ]
    },
    "mobile_enterprise_monthly": {
      name: "Enterprise",
      price: "$400/month",
      features: [
        "Complex App",
        "iOS & Android",
        "Premium UI/UX",
        "Push Notifications",
        "In-App Purchases",
        "API Integration",
        "Monthly Updates"
      ]
    },
    "mobile_enterprise_yearly": {
      name: "Enterprise",
      price: "$4000/year",
      features: [
        "Complex App",
        "iOS & Android",
        "Premium UI/UX",
        "Push Notifications",
        "In-App Purchases",
        "API Integration",
        "Yearly Updates"
      ]
    },
    "graphic_basic_onetime": {
      name: "Basic",
      price: "$300",
      features: [
        "Logo Design",
        "Business Card Design",
        "Flyer Design"
      ]
    },
    "graphic_basic_monthly": {
      name: "Basic",
      price: "$30/month",
      features: [
        "Logo Design",
        "Business Card Design",
        "Flyer Design",
        "Monthly Revisions"
      ]
    },
    "graphic_basic_yearly": {
      name: "Basic",
      price: "$300/year",
      features: [
        "Logo Design",
        "Business Card Design",
        "Flyer Design",
        "Yearly Revisions"
      ]
    },
    "graphic_standard_onetime": {
      name: "Standard",
      price: "$600",
      features: [
        "Logo Design",
        "Business Card Design",
        "Flyer Design",
        "Brochure Design",
        "Social Media Kit"
      ]
    },
    "graphic_standard_monthly": {
      name: "Standard",
      price: "$60/month",
      features: [
        "Logo Design",
        "Business Card Design",
        "Flyer Design",
        "Brochure Design",
        "Social Media Kit",
        "Monthly Revisions"
      ]
    },
    "graphic_standard_yearly": {
      name: "Standard",
      price: "$600/year",
      features: [
        "Logo Design",
        "Business Card Design",
        "Flyer Design",
        "Brochure Design",
        "Social Media Kit",
        "Yearly Revisions"
      ]
    },
    "graphic_enterprise_onetime": {
      name: "Enterprise",
      price: "$1200",
      features: [
        "Logo Design",
        "Business Card Design",
        "Flyer Design",
        "Brochure Design",
        "Social Media Kit",
        "Packaging Design"
      ]
    },
    "graphic_enterprise_monthly": {
      name: "Enterprise",
      price: "$120/month",
      features: [
        "Logo Design",
        "Business Card Design",
        "Flyer Design",
        "Brochure Design",
        "Social Media Kit",
        "Packaging Design",
        "Monthly Revisions"
      ]
    },
    "graphic_enterprise_yearly": {
      name: "Enterprise",
      price: "$1200/year",
      features: [
        "Logo Design",
        "Business Card Design",
        "Flyer Design",
        "Brochure Design",
        "Social Media Kit",
        "Packaging Design",
        "Yearly Revisions"
      ]
    },
    "marketing_basic_onetime": {
      name: "Basic",
      price: "$400",
      features: [
        "Social Media Setup",
        "Basic SEO",
        "Content Creation"
      ]
    },
    "marketing_basic_monthly": {
      name: "Basic",
      price: "$40/month",
      features: [
        "Social Media Setup",
        "Basic SEO",
        "Content Creation",
        "Monthly Reports"
      ]
    },
    "marketing_basic_yearly": {
      name: "Basic",
      price: "$400/year",
      features: [
        "Social Media Setup",
        "Basic SEO",
        "Content Creation",
        "Yearly Reports"
      ]
    },
    "marketing_standard_onetime": {
      name: "Standard",
      price: "$800",
      features: [
        "Social Media Management",
        "Advanced SEO",
        "Content Creation",
        "Email Marketing"
      ]
    },
    "marketing_standard_monthly": {
      name: "Standard",
      price: "$80/month",
      features: [
        "Social Media Management",
        "Advanced SEO",
        "Content Creation",
        "Email Marketing",
        "Monthly Reports"
      ]
    },
    "marketing_standard_yearly": {
      name: "Standard",
      price: "$800/year",
      features: [
        "Social Media Management",
        "Advanced SEO",
        "Content Creation",
        "Email Marketing",
        "Yearly Reports"
      ]
    },
    "marketing_enterprise_onetime": {
      name: "Enterprise",
      price: "$1600",
      features: [
        "Comprehensive Marketing Strategy",
        "Premium SEO",
        "Content Creation",
        "Email Marketing",
        "PPC Campaigns"
      ]
    },
    "marketing_enterprise_monthly": {
      name: "Enterprise",
      price: "$160/month",
      features: [
        "Comprehensive Marketing Strategy",
        "Premium SEO",
        "Content Creation",
        "Email Marketing",
        "PPC Campaigns",
        "Monthly Reports"
      ]
    },
    "marketing_enterprise_yearly": {
      name: "Enterprise",
      price: "$1600/year",
      features: [
        "Comprehensive Marketing Strategy",
        "Premium SEO",
        "Content Creation",
        "Email Marketing",
        "PPC Campaigns",
        "Yearly Reports"
      ]
    }
  };

  // Web Basic Package State
  const [web_basic_selectedPackage, web_basic_setSelectedPackage] = useState(packages.web_basic_onetime);

  // Web Standard Package State
  const [web_standard_selectedPackage, web_standard_setSelectedPackage] = useState(packages.web_standard_onetime);

  // Web Enterprise Package State
  const [web_enterprise_selectedPackage, web_enterprise_setSelectedPackage] = useState(packages.web_enterprise_onetime);

  // Mobile Basic Package State
  const [mobile_basic_selectedPackage, mobile_basic_setSelectedPackage] = useState(packages.web_basic_onetime);
  
  // Mobile Standard Package State
  const [mobile_standard_selectedPackage, mobile_standard_setSelectedPackage] = useState(packages.web_standard_onetime);

  // Mobile Enterprise Package State
  const [mobile_enterprise_selectedPackage, mobile_enterprise_setSelectedPackage] = useState(packages.web_enterprise_onetime);
  
  // Graphic Basic Package State
  const [graphic_basic_selectedPackage, graphic_basic_setSelectedPackage] = useState(packages.web_basic_onetime);

  // Graphic Standard Package State
  const [graphic_standard_selectedPackage, graphic_standard_setSelectedPackage] = useState(packages.web_standard_onetime);
  
  // Graphic Enterprise Package State
  const [graphic_enterprise_selectedPackage, graphic_enterprise_setSelectedPackage] = useState(packages.web_enterprise_onetime);

  // Marketing Basic Package State
  const [marketing_basic_selectedPackage, marketing_basic_setSelectedPackage] = useState(packages.web_basic_onetime);

  // Marketing Standard Package State
  const [marketing_standard_selectedPackage, marketing_standard_setSelectedPackage] = useState(packages.web_standard_onetime);    

  // Marketing Enterprise Package State
  const [marketing_enterprise_selectedPackage, marketing_enterprise_setSelectedPackage] = useState(packages.web_enterprise_onetime);

  return (
    <>
      <p className='text-center text-3xl lg:text-5xl mb-20 mt-40 text-white'>Web Development Packages</p>
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 text-white gap-20">

          <div className="package_card">

            <div className="package_type">
              <h2 className="text-3xl">{ web_basic_selectedPackage.name }</h2>
              <p className="text-5xl">{ web_basic_selectedPackage.price }</p>
            </div>

            <div className="package_features">
              <ul>
                {web_basic_selectedPackage.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="button_holder grid grid-cols-1 md:grid-cols-3 gap-10">
              <div><button className="package_button" onClick={() => web_basic_setSelectedPackage(packages.web_basic_onetime)}>One Time</button></div>
              <div><button className="package_button" onClick={() => web_basic_setSelectedPackage(packages.web_basic_monthly)}>Monthly</button></div>
              <div><button className="package_button" onClick={() => web_basic_setSelectedPackage(packages.web_basic_yearly)}>Yearly</button></div>
            </div>

          </div>

          <div className="package_card">

            <div className="package_type">
              <h2 className="text-3xl">{ web_standard_selectedPackage.name }</h2>
              <p className="text-5xl">{ web_standard_selectedPackage.price }</p>
            </div>

            <div className="package_features">
              <ul>
                {web_standard_selectedPackage.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="button_holder grid grid-cols-1 md:grid-cols-3 gap-10">
              <div><button className="package_button" onClick={() => web_standard_setSelectedPackage(packages.web_standard_onetime)}>One Time</button></div>
              <div><button className="package_button" onClick={() => web_standard_setSelectedPackage(packages.web_standard_monthly)}>Monthly</button></div>
              <div><button className="package_button" onClick={() => web_standard_setSelectedPackage(packages.web_standard_yearly)}>Yearly</button></div>
            </div>

          </div>

          <div className="package_card">

            <div className="package_type">
              <h2 className="text-3xl">{ web_enterprise_selectedPackage.name }</h2>
              <p className="text-5xl">{ web_enterprise_selectedPackage.price }</p>
            </div>

            <div className="package_features">
              <ul>
                {web_enterprise_selectedPackage.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="button_holder grid grid-cols-1 md:grid-cols-3 gap-10">
              <div><button className="package_button" onClick={() => web_enterprise_setSelectedPackage(packages.web_enterprise_onetime)}>One Time</button></div>
              <div><button className="package_button" onClick={() => web_enterprise_setSelectedPackage(packages.web_enterprise_monthly)}>Monthly</button></div>
              <div><button className="package_button" onClick={() => web_enterprise_setSelectedPackage(packages.web_enterprise_yearly)}>Yearly</button></div>
            </div>

          </div>

      </div>

      <p className='text-center text-3xl lg:text-5xl mb-20 mt-40 text-white'>Mobile App Development Packages</p>
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 text-white gap-20">

          <div className="package_card">

            <div className="package_type">
              <h2 className="text-3xl">{ mobile_basic_selectedPackage.name }</h2>
              <p className="text-5xl">{ mobile_basic_selectedPackage.price }</p>
            </div>

            <div className="package_features">
              <ul>
                {mobile_basic_selectedPackage.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="button_holder grid grid-cols-1 md:grid-cols-3 gap-10">
              <div><button className="package_button" onClick={() => mobile_basic_setSelectedPackage(packages.mobile_basic_onetime)}>One Time</button></div>
              <div><button className="package_button" onClick={() => mobile_basic_setSelectedPackage(packages.mobile_basic_monthly)}>Monthly</button></div>
              <div><button className="package_button" onClick={() => mobile_basic_setSelectedPackage(packages.mobile_basic_yearly)}>Yearly</button></div>
            </div>

          </div>

          <div className="package_card">

            <div className="package_type">
              <h2 className="text-3xl">{ mobile_standard_selectedPackage.name }</h2>
              <p className="text-5xl">{ mobile_standard_selectedPackage.price }</p>
            </div>

            <div className="package_features">
              <ul>
                {mobile_standard_selectedPackage.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="button_holder grid grid-cols-1 md:grid-cols-3 gap-10">
              <div><button className="package_button" onClick={() => mobile_standard_setSelectedPackage(packages.mobile_standard_onetime)}>One Time</button></div>
              <div><button className="package_button" onClick={() => mobile_standard_setSelectedPackage(packages.mobile_standard_monthly)}>Monthly</button></div>
              <div><button className="package_button" onClick={() => mobile_standard_setSelectedPackage(packages.mobile_standard_yearly)}>Yearly</button></div>
            </div>

          </div>

          <div className="package_card">

            <div className="package_type">
              <h2 className="text-3xl">{ mobile_enterprise_selectedPackage.name }</h2>
              <p className="text-5xl">{ mobile_enterprise_selectedPackage.price }</p>
            </div>

            <div className="package_features">
              <ul>
                {mobile_enterprise_selectedPackage.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="button_holder grid grid-cols-1 md:grid-cols-3 gap-10">
              <div><button className="package_button" onClick={() => mobile_enterprise_setSelectedPackage(packages.mobile_enterprise_onetime)}>One Time</button></div>
              <div><button className="package_button" onClick={() => mobile_enterprise_setSelectedPackage(packages.mobile_enterprise_monthly)}>Monthly</button></div>
              <div><button className="package_button" onClick={() => mobile_enterprise_setSelectedPackage(packages.mobile_enterprise_yearly)}>Yearly</button></div>
            </div>

          </div>

      </div>

      <p className='text-center text-3xl lg:text-5xl mb-20 mt-40 text-white'>Graphic Designing Packages</p>
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 text-white gap-20">

          <div className="package_card">

            <div className="package_type">
              <h2 className="text-3xl">{ graphic_basic_selectedPackage.name }</h2>
              <p className="text-5xl">{ graphic_basic_selectedPackage.price }</p>
            </div>

            <div className="package_features">
              <ul>
                {graphic_basic_selectedPackage.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="button_holder grid grid-cols-1 md:grid-cols-3 gap-10">
              <div><button className="package_button" onClick={() => graphic_basic_setSelectedPackage(packages.graphic_basic_onetime)}>One Time</button></div>
              <div><button className="package_button" onClick={() => graphic_basic_setSelectedPackage(packages.graphic_basic_monthly)}>Monthly</button></div>
              <div><button className="package_button" onClick={() => graphic_basic_setSelectedPackage(packages.graphic_basic_yearly)}>Yearly</button></div>
            </div>

          </div>

          <div className="package_card">

            <div className="package_type">
              <h2 className="text-3xl">{ graphic_standard_selectedPackage.name }</h2>
              <p className="text-5xl">{ graphic_standard_selectedPackage.price }</p>
            </div>

            <div className="package_features">
              <ul>
                {mobile_standard_selectedPackage.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="button_holder grid grid-cols-1 md:grid-cols-3 gap-10">
              <div><button className="package_button" onClick={() => graphic_standard_setSelectedPackage(packages.graphic_standard_onetime)}>One Time</button></div>
              <div><button className="package_button" onClick={() => graphic_standard_setSelectedPackage(packages.graphic_standard_monthly)}>Monthly</button></div>
              <div><button className="package_button" onClick={() => graphic_standard_setSelectedPackage(packages.graphic_standard_yearly)}>Yearly</button></div>
            </div>

          </div>

          <div className="package_card">

            <div className="package_type">
              <h2 className="text-3xl">{ graphic_enterprise_selectedPackage.name }</h2>
              <p className="text-5xl">{ graphic_enterprise_selectedPackage.price }</p>
            </div>

            <div className="package_features">
              <ul>
                {graphic_enterprise_selectedPackage.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="button_holder grid grid-cols-1 md:grid-cols-3 gap-10">
              <div><button className="package_button" onClick={() => graphic_enterprise_setSelectedPackage(packages.graphic_enterprise_onetime)}>One Time</button></div>
              <div><button className="package_button" onClick={() => graphic_enterprise_setSelectedPackage(packages.graphic_enterprise_monthly)}>Monthly</button></div>
              <div><button className="package_button" onClick={() => graphic_enterprise_setSelectedPackage(packages.graphic_enterprise_yearly)}>Yearly</button></div>
            </div>

          </div>

      </div>

      <p className='text-center text-3xl lg:text-5xl mb-20 mt-40 text-white'>Digital Marketing Packages</p>
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 text-white gap-20">

          <div className="package_card">

            <div className="package_type">
              <h2 className="text-3xl">{ marketing_basic_selectedPackage.name }</h2>
              <p className="text-5xl">{ marketing_basic_selectedPackage.price }</p>
            </div>

            <div className="package_features">
              <ul>
                {marketing_basic_selectedPackage.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="button_holder grid grid-cols-1 md:grid-cols-3 gap-10">
              <div><button className="package_button" onClick={() => marketing_basic_setSelectedPackage(packages.marketing_basic_onetime)}>One Time</button></div>
              <div><button className="package_button" onClick={() => marketing_basic_setSelectedPackage(packages.marketing_basic_monthly)}>Monthly</button></div>
              <div><button className="package_button" onClick={() => marketing_basic_setSelectedPackage(packages.marketing_basic_yearly)}>Yearly</button></div>
            </div>

          </div>

          <div className="package_card">

            <div className="package_type">
              <h2 className="text-3xl">{ marketing_standard_selectedPackage.name }</h2>
              <p className="text-5xl">{ marketing_standard_selectedPackage.price }</p>
            </div>

            <div className="package_features">
              <ul>
                {mobile_standard_selectedPackage.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="button_holder grid grid-cols-1 md:grid-cols-3 gap-10">
              <div><button className="package_button" onClick={() => marketing_standard_setSelectedPackage(packages.marketing_standard_onetime)}>One Time</button></div>
              <div><button className="package_button" onClick={() => marketing_standard_setSelectedPackage(packages.marketing_standard_monthly)}>Monthly</button></div>
              <div><button className="package_button" onClick={() => marketing_standard_setSelectedPackage(packages.marketing_standard_yearly)}>Yearly</button></div>
            </div>

          </div>

          <div className="package_card">

            <div className="package_type">
              <h2 className="text-3xl">{ marketing_enterprise_selectedPackage.name }</h2>
              <p className="text-5xl">{ marketing_enterprise_selectedPackage.price }</p>
            </div>

            <div className="package_features">
              <ul>
                {marketing_enterprise_selectedPackage.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="button_holder grid grid-cols-1 md:grid-cols-3 gap-10">
              <div><button className="package_button" onClick={() => marketing_enterprise_setSelectedPackage(packages.marketing_enterprise_onetime)}>One Time</button></div>
              <div><button className="package_button" onClick={() => marketing_enterprise_setSelectedPackage(packages.marketing_enterprise_monthly)}>Monthly</button></div>
              <div><button className="package_button" onClick={() => marketing_enterprise_setSelectedPackage(packages.marketing_enterprise_yearly)}>Yearly</button></div>
            </div>

          </div>

      </div>

    </>
  )
}

export default package_detail