'use strict';

/**
 * Market-area geography. Country → state/province → city.
 * `roles` drives the keyword formula: [Service] + [Role] + [Location].
 */
const countries = [
  {
    name: 'India',
    label: 'Pan-India',
    code: 'IN',
    currency: 'INR ₹',
    timezone: 'IST · UTC+5:30',
    overlap: 'Full working-day overlap',
    languages: 'English, Hindi and 8 regional languages',
    kickoff: 'Kickoff in 3–5 working days',
    roles: ['Company', 'Agency', 'Service Provider', 'Supplier'],
    featured: true,
    intro: 'We work with businesses across India from our Delhi studio — same time zone, same working week, and a delivery process built for Indian procurement, GST invoicing and how people actually search here. From metros to tier-2 and tier-3 markets, the work is the same: a fast site, a clear offer and local visibility that compounds.',
    states: [
      { name: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore', 'Kurnool', 'Rajahmundry', 'Kakinada', 'Anantapur'] },
      { name: 'Arunachal Pradesh', cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang'] },
      { name: 'Assam', cities: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Tezpur', 'Nagaon', 'Tinsukia'] },
      { name: 'Bihar', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Begusarai', 'Arrah'] },
      { name: 'Chhattisgarh', cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur'] },
      { name: 'Goa', cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'] },
      { name: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Vapi'] },
      { name: 'Haryana', cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak', 'Sonipat', 'Panchkula'] },
      { name: 'Himachal Pradesh', cities: ['Shimla', 'Manali', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Hamirpur'] },
      { name: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Ramgarh'] },
      { name: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Davangere', 'Ballari', 'Shivamogga', 'Tumakuru', 'Udupi'] },
      { name: 'Kerala', cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Alappuzha', 'Palakkad', 'Kottayam'] },
      { name: 'Madhya Pradesh', cities: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Rewa', 'Satna', 'Ratlam', 'Katni'] },
      { name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Chhatrapati Sambhajinagar', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded', 'Sangli', 'Jalgaon', 'Navi Mumbai', 'Latur'] },
      { name: 'Manipur', cities: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur'] },
      { name: 'Meghalaya', cities: ['Shillong', 'Tura', 'Jowai', 'Nongstoin'] },
      { name: 'Mizoram', cities: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'] },
      { name: 'Nagaland', cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'] },
      { name: 'Odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Baripada'] },
      { name: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Pathankot'] },
      { name: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bhilwara', 'Sikar', 'Bharatpur'] },
      { name: 'Sikkim', cities: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'] },
      { name: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Thanjavur', 'Hosur'] },
      { name: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Secunderabad'] },
      { name: 'Tripura', cities: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar'] },
      { name: 'Uttar Pradesh', cities: ['Noida', 'Greater Noida', 'Ghaziabad', 'Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Meerut', 'Prayagraj', 'Bareilly', 'Aligarh', 'Moradabad', 'Gorakhpur', 'Jhansi', 'Mathura', 'Ayodhya'] },
      { name: 'Uttarakhand', cities: ['Dehradun', 'Haridwar', 'Rishikesh', 'Roorkee', 'Haldwani', 'Nainital', 'Rudrapur'] },
      { name: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol', 'Kharagpur', 'Bardhaman', 'Malda', 'Jalpaiguri'] },
      { name: 'Andaman and Nicobar Islands', cities: ['Port Blair', 'Havelock Island', 'Car Nicobar'] },
      { name: 'Chandigarh', cities: ['Chandigarh'] },
      { name: 'Dadra and Nagar Haveli and Daman and Diu', cities: ['Silvassa', 'Daman', 'Diu'] },
      { name: 'Delhi', cities: ['New Delhi', 'Dwarka', 'Rohini', 'Saket', 'Karol Bagh', 'Janakpuri', 'Pitampura', 'Lajpat Nagar'] },
      { name: 'Jammu and Kashmir', cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua'] },
      { name: 'Ladakh', cities: ['Leh', 'Kargil'] },
      { name: 'Lakshadweep', cities: ['Kavaratti', 'Agatti', 'Minicoy'] },
      { name: 'Puducherry', cities: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'] }
    ]
  },
  {
    name: 'Nepal',
    label: 'Nepal',
    code: 'NP',
    currency: 'NPR / INR / USD',
    timezone: 'NPT · UTC+5:45',
    overlap: 'Full working-day overlap',
    languages: 'English and Nepali',
    kickoff: 'Kickoff in 5–7 working days',
    roles: ['Company', 'Agency', 'Service Provider', 'Supplier'],
    featured: true,
    intro: 'Nepal is a short flight from Delhi and shares our working day, which makes collaboration unusually easy. We work with Kathmandu, Pokhara and Biratnagar businesses on websites, e-commerce and search visibility — with content in English or Nepali, and invoicing in INR or USD.',
    states: [
      { name: 'Bagmati', cities: ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Hetauda', 'Bharatpur'] },
      { name: 'Koshi', cities: ['Biratnagar', 'Dharan', 'Itahari', 'Birtamod'] },
      { name: 'Madhesh', cities: ['Janakpur', 'Birgunj', 'Rajbiraj'] },
      { name: 'Gandaki', cities: ['Pokhara', 'Gorkha', 'Baglung'] },
      { name: 'Lumbini', cities: ['Butwal', 'Bhairahawa', 'Nepalgunj'] },
      { name: 'Karnali', cities: ['Birendranagar', 'Jumla'] },
      { name: 'Sudurpashchim', cities: ['Dhangadhi', 'Mahendranagar'] }
    ]
  },
  {
    name: 'United Arab Emirates',
    label: 'Dubai & UAE',
    code: 'AE',
    currency: 'AED / USD',
    timezone: 'GST · UTC+4',
    overlap: '1.5-hour difference from IST',
    languages: 'English and Arabic',
    kickoff: 'Kickoff in 5–7 working days',
    roles: ['Company', 'Agency', 'Digital Agency', 'Supplier'],
    featured: true,
    intro: 'Dubai and the wider UAE buy internationally and move quickly. We support UAE businesses with websites, e-commerce and search visibility, working across the short India–Gulf time difference. Arabic content and local compliance are handled with vetted partners, so the English and Arabic experiences stay consistent.',
    states: [
      { name: 'Dubai', cities: ['Dubai', 'Jebel Ali', 'Deira', 'Business Bay', 'Dubai Marina'] },
      { name: 'Abu Dhabi', cities: ['Abu Dhabi', 'Al Ain', 'Khalifa City', 'Mussafah'] },
      { name: 'Sharjah', cities: ['Sharjah', 'Al Nahda', 'Khor Fakkan'] },
      { name: 'Ajman', cities: ['Ajman'] },
      { name: 'Ras Al Khaimah', cities: ['Ras Al Khaimah'] },
      { name: 'Fujairah', cities: ['Fujairah'] },
      { name: 'Umm Al Quwain', cities: ['Umm Al Quwain'] }
    ]
  },
  {
    name: 'Thailand',
    label: 'Thailand',
    code: 'TH',
    currency: 'THB / USD',
    timezone: 'ICT · UTC+7',
    overlap: '1.5-hour difference from IST',
    languages: 'English and Thai',
    kickoff: 'Kickoff in 5–7 working days',
    roles: ['Company', 'Agency', 'Service Provider', 'Supplier'],
    featured: true,
    intro: 'Thailand is mobile-first and tourism-heavy, which changes what a website has to do: load fast on a phone, answer questions in two languages, and convert before the visitor walks into a competitor. We work with hospitality, retail and service businesses in Bangkok, Phuket, Chiang Mai and the eastern seaboard.',
    states: [
      { name: 'Bangkok', cities: ['Bangkok', 'Nonthaburi', 'Pathum Thani', 'Samut Prakan'] },
      { name: 'Chiang Mai', cities: ['Chiang Mai', 'Lamphun'] },
      { name: 'Chonburi', cities: ['Pattaya', 'Si Racha', 'Chonburi'] },
      { name: 'Phuket', cities: ['Phuket', 'Patong'] },
      { name: 'Khon Kaen', cities: ['Khon Kaen'] },
      { name: 'Nakhon Ratchasima', cities: ['Nakhon Ratchasima'] },
      { name: 'Songkhla', cities: ['Hat Yai', 'Songkhla'] },
      { name: 'Rayong', cities: ['Rayong', 'Map Ta Phut'] },
      { name: 'Surat Thani', cities: ['Surat Thani', 'Koh Samui'] },
      { name: 'Udon Thani', cities: ['Udon Thani'] }
    ]
  },
  {
    name: 'Saudi Arabia',
    label: 'Saudi Arabia',
    code: 'SA',
    currency: 'SAR / USD',
    timezone: 'AST · UTC+3',
    overlap: '2.5-hour difference from IST',
    languages: 'English and Arabic',
    kickoff: 'Kickoff in 7–10 working days',
    roles: ['Company', 'Agency', 'Service Provider', 'Supplier'],
    featured: true,
    intro: 'Vision 2030 spending has pushed digital presence to board level in Saudi Arabia. We deliver bilingual-ready websites, e-commerce and acquisition programmes for Saudi businesses, with Arabic copy, RTL layouts and local payment expectations handled through vetted partners.',
    states: [
      { name: 'Riyadh', cities: ['Riyadh', 'Al Kharj', 'Diriyah'] },
      { name: 'Makkah', cities: ['Jeddah', 'Makkah', 'Taif', 'Rabigh'] },
      { name: 'Madinah', cities: ['Madinah', 'Yanbu'] },
      { name: 'Eastern Province', cities: ['Dammam', 'Al Khobar', 'Dhahran', 'Jubail', 'Hofuf'] },
      { name: 'Asir', cities: ['Abha', 'Khamis Mushait'] },
      { name: 'Qassim', cities: ['Buraidah', 'Unaizah'] },
      { name: 'Tabuk', cities: ['Tabuk', 'NEOM'] },
      { name: 'Hail', cities: ['Hail'] },
      { name: 'Jazan', cities: ['Jazan'] },
      { name: 'Najran', cities: ['Najran'] },
      { name: 'Al Baha', cities: ['Al Baha'] },
      { name: 'Al Jouf', cities: ['Sakaka', 'Al Qurayyat'] },
      { name: 'Northern Borders', cities: ['Arar'] }
    ]
  },
  {
    name: 'United States',
    label: 'USA',
    code: 'US',
    currency: 'USD $',
    timezone: 'ET / CT / MT / PT',
    overlap: '3–4 hour daily overlap',
    languages: 'English',
    kickoff: 'Kickoff in 7–10 working days',
    roles: ['Company', 'Agency', 'Service Provider', 'Exporter'],
    featured: true,
    intro: 'For US clients we work as an extension of the in-house team: a fixed daily overlap, written async updates and pricing in USD. Typical engagements are website design, CRO and SEO for B2B and D2C brands that need senior execution without a full-time hire.',
    states: [
      { name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Irvine'] },
      { name: 'New York', cities: ['New York City', 'Buffalo', 'Rochester', 'Albany'] },
      { name: 'Texas', cities: ['Austin', 'Dallas', 'Houston', 'San Antonio'] },
      { name: 'Florida', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville'] },
      { name: 'Illinois', cities: ['Chicago', 'Naperville'] },
      { name: 'Washington', cities: ['Seattle', 'Bellevue'] },
      { name: 'Massachusetts', cities: ['Boston', 'Cambridge'] },
      { name: 'Georgia', cities: ['Atlanta', 'Savannah'] },
      { name: 'New Jersey', cities: ['Newark', 'Jersey City', 'Edison'] },
      { name: 'Pennsylvania', cities: ['Philadelphia', 'Pittsburgh'] },
      { name: 'Ohio', cities: ['Columbus', 'Cleveland'] },
      { name: 'Arizona', cities: ['Phoenix', 'Scottsdale', 'Tucson'] },
      { name: 'Colorado', cities: ['Denver', 'Boulder'] },
      { name: 'Michigan', cities: ['Detroit', 'Ann Arbor'] },
      { name: 'North Carolina', cities: ['Charlotte', 'Raleigh'] }
    ]
  },
  {
    name: 'United Kingdom',
    label: 'UK',
    code: 'GB',
    currency: 'GBP £',
    timezone: 'GMT / BST',
    overlap: 'Overlap 09:00–18:00 GMT',
    languages: 'English',
    kickoff: 'Kickoff in 5–7 working days',
    roles: ['Company', 'Agency', 'Service Provider', 'Exporter'],
    featured: true,
    intro: 'UK clients get a senior team, clear scope and pricing in GBP, with a working overlap through the London day. We handle design, build and ongoing search and content — and we are comfortable working inside UK procurement, GDPR and accessibility expectations.',
    states: [
      { name: 'England', cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol', 'Newcastle upon Tyne', 'Sheffield', 'Nottingham', 'Cambridge', 'Oxford', 'Reading', 'Leicester', 'Coventry'] },
      { name: 'Scotland', cities: ['Glasgow', 'Edinburgh', 'Aberdeen', 'Dundee'] },
      { name: 'Wales', cities: ['Cardiff', 'Swansea', 'Newport'] },
      { name: 'Northern Ireland', cities: ['Belfast', 'Derry', 'Lisburn'] }
    ]
  }
];

/** Cities that get prominent placement on the market-area hub. */
const featuredCities = [
  'New Delhi', 'Noida', 'Gurugram', 'Mumbai', 'Pune', 'Bengaluru', 'Hyderabad',
  'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Indore',
  'Kathmandu', 'Pokhara', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Bangkok', 'Pattaya',
  'Riyadh', 'Jeddah', 'Dammam', 'New York City', 'Los Angeles', 'Chicago',
  'Austin', 'London', 'Manchester', 'Birmingham', 'Glasgow'
];

module.exports = { countries, featuredCities };
