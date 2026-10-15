// Chhattisgarh cities, localities and landmarks used for search filters,
// city landing pages and SEO. Durg and Bhilai come first: they are the core market.

export const STATE = 'Chhattisgarh';

export const CITIES = [
  {
    slug: 'bhilai', name: 'Bhilai', hindi: 'भिलाई', district: 'Durg', primary: true,
    blurb: 'Steel city of Chhattisgarh, home to Bhilai Steel Plant, IIT Bhilai and a large student and working population.',
    localities: ['Supela', 'Nehru Nagar', 'Smriti Nagar', 'Kohka', 'Junwani', 'Risali', 'Civic Centre', 'Power House', 'Khursipar', 'Hudco', 'Maroda', 'Shanti Nagar', 'Vaishali Nagar', 'Talpuri', 'Sector 1', 'Sector 2', 'Sector 4', 'Sector 5', 'Sector 6', 'Sector 7', 'Sector 9', 'Sector 10', 'Bhilai 3', 'Charoda', 'Kurud', 'Camp Area', 'Ruabandha'],
  },
  {
    slug: 'durg', name: 'Durg', hindi: 'दुर्ग', district: 'Durg', primary: true,
    blurb: 'Twin city of Bhilai and district headquarters, with colleges like BIT Durg and easy rail access on the Howrah–Mumbai line.',
    localities: ['Padmanabhpur', 'Kasaridih', 'Ganjpara', 'Shankar Nagar', 'Deepak Nagar', 'Borsi', 'Pulgaon', 'Station Road', 'Malviya Nagar', 'Adarsh Nagar', 'Tilak Nagar', 'Gaya Nagar', 'Mohan Nagar', 'Shivnath Nagar', 'Bogha Para', 'Rajendra Park', 'Utai', 'Jamul'],
  },
  {
    slug: 'raipur', name: 'Raipur', hindi: 'रायपुर', district: 'Raipur',
    blurb: 'State capital with AIIMS Raipur, NIT Raipur, Pt. Ravishankar Shukla University and the fast-growing Nava Raipur.',
    localities: ['Shankar Nagar', 'Telibandha', 'Pandri', 'Tatibandh', 'Mowa', 'Amanaka', 'Devendra Nagar', 'Civil Lines', 'Samta Colony', 'Kota', 'New Rajendra Nagar', 'Daldal Seoni', 'Avanti Vihar', 'Saddu', 'Gudhiyari', 'Shailendra Nagar', 'Nava Raipur'],
  },
  {
    slug: 'bilaspur', name: 'Bilaspur', hindi: 'बिलासपुर', district: 'Bilaspur',
    blurb: 'Seat of the High Court of Chhattisgarh and Guru Ghasidas University, with a steady demand for student PGs.',
    localities: ['Vyapar Vihar', 'Sarkanda', 'Rajkishore Nagar', 'Mangla', 'Telipara', 'Seepat Road', 'Torwa', 'Nehru Nagar', 'Koni', 'Tikrapara'],
  },
  { slug: 'rajnandgaon', name: 'Rajnandgaon', hindi: 'राजनांदगांव', district: 'Rajnandgaon', blurb: 'Close to Durg, with a growing number of rentals near the town centre and colleges.', localities: ['Kamla College Road', 'Gaurav Path', 'Lakholi', 'Bharkapara', 'Ramdarbar'] },
  { slug: 'korba', name: 'Korba', hindi: 'कोरबा', district: 'Korba', blurb: 'Power-plant town where working professionals look for family flats and shared rooms.', localities: ['Kosabadi', 'Transport Nagar', 'Niharika', 'Balco Nagar', 'Jamnipali'] },
  { slug: 'raigarh', name: 'Raigarh', hindi: 'रायगढ़', district: 'Raigarh', blurb: 'Industrial town with demand from plant employees and students.', localities: ['Chakradhar Nagar', 'Kotra Road', 'Boirdadar', 'Jutmil'] },
  { slug: 'jagdalpur', name: 'Jagdalpur', hindi: 'जगदलपुर', district: 'Bastar', blurb: 'Gateway to Bastar, with rentals for medical students and government staff.', localities: ['Dharampura', 'Lalbagh', 'Aamaguda', 'Kumharpara'] },
  { slug: 'ambikapur', name: 'Ambikapur', hindi: 'अम्बिकापुर', district: 'Surguja', blurb: 'Main city of north Chhattisgarh with student and staff demand.', localities: ['Gandhi Nagar', 'Namnakala', 'Darripara', 'Banaras Road'] },
  { slug: 'dhamtari', name: 'Dhamtari', hindi: 'धमतरी', district: 'Dhamtari', blurb: 'Quiet town near Raipur, popular for family rentals.', localities: ['Ratnabandha', 'Sihawa Road', 'Gokulpur'] },
];

// Landmarks people actually search around ("PG near IIT Bhilai").
export const LANDMARKS = [
  { slug: 'iit-bhilai', name: 'IIT Bhilai', city: 'durg', kind: 'college', localities: ['Kutelabhata', 'Jevra Sirsa', 'Durg'] },
  { slug: 'bit-durg', name: 'BIT Durg', city: 'durg', kind: 'college', localities: ['Padmanabhpur', 'Kasaridih', 'Durg'] },
  { slug: 'csvtu-bhilai', name: 'CSVTU Bhilai', city: 'bhilai', kind: 'college', localities: ['Newai', 'Kohka', 'Junwani'] },
  { slug: 'shri-shankaracharya-bhilai', name: 'Shri Shankaracharya College, Bhilai', city: 'bhilai', kind: 'college', localities: ['Junwani', 'Kohka', 'Smriti Nagar'] },
  { slug: 'rungta-college-bhilai', name: 'Rungta College, Bhilai', city: 'bhilai', kind: 'college', localities: ['Kohka', 'Kurud', 'Junwani'] },
  { slug: 'bhilai-steel-plant', name: 'Bhilai Steel Plant', city: 'bhilai', kind: 'workplace', localities: ['Sector 1', 'Sector 4', 'Sector 6', 'Civic Centre'] },
  { slug: 'durg-railway-station', name: 'Durg Railway Station', city: 'durg', kind: 'transit', localities: ['Station Road', 'Mohan Nagar', 'Shivnath Nagar'] },
  { slug: 'aiims-raipur', name: 'AIIMS Raipur', city: 'raipur', kind: 'hospital', localities: ['Tatibandh', 'Amanaka', 'Gogaon'] },
  { slug: 'nit-raipur', name: 'NIT Raipur', city: 'raipur', kind: 'college', localities: ['Amanaka', 'Daldal Seoni', 'Tatibandh'] },
  { slug: 'pt-ravishankar-university', name: 'Pt. Ravishankar Shukla University', city: 'raipur', kind: 'college', localities: ['Amanaka', 'Daldal Seoni', 'Kota'] },
  { slug: 'guru-ghasidas-university', name: 'Guru Ghasidas University, Bilaspur', city: 'bilaspur', kind: 'college', localities: ['Koni', 'Seepat Road', 'Mangla'] },
];

export const LISTING_TYPES = [
  { slug: 'flats', value: 'flat', label: 'Flat', plural: 'Flats', hindi: 'फ्लैट' },
  { slug: 'pg', value: 'pg', label: 'PG', plural: 'PGs', hindi: 'पीजी' },
  { slug: 'rooms', value: 'room', label: 'Room', plural: 'Rooms', hindi: 'कमरा' },
  { slug: 'flatmates', value: 'flatmate', label: 'Flatmate', plural: 'Flatmate wanted', hindi: 'फ्लैटमेट' },
];

export const BHK = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'Single room', 'Shared room'];
export const FURNISHING = ['Unfurnished', 'Semi-furnished', 'Fully furnished'];
export const TENANT_PREFS = [
  { value: 'any', label: 'Anyone' },
  { value: 'boys', label: 'Boys / men' },
  { value: 'girls', label: 'Girls / women' },
  { value: 'family', label: 'Family' },
  { value: 'working', label: 'Working professionals' },
  { value: 'students', label: 'Students' },
];
export const AMENITIES = ['Wi-Fi', 'AC', 'Cooler', 'Geyser', 'Food / tiffin', 'Washing machine', 'Fridge', 'RO water', 'Power backup', 'Parking (2-wheeler)', 'Parking (car)', 'Lift', 'CCTV', 'Housekeeping', 'Attached bathroom', 'Balcony', 'Separate entry', 'Gated society'];

export const cityBySlug = (s) => CITIES.find((c) => c.slug === s);
export const typeBySlug = (s) => LISTING_TYPES.find((t) => t.slug === s);
export const typeByValue = (v) => LISTING_TYPES.find((t) => t.value === v);
export const landmarkBySlug = (s) => LANDMARKS.find((l) => l.slug === s);
export const tenantLabel = (v) => TENANT_PREFS.find((t) => t.value === v)?.label || 'Anyone';
