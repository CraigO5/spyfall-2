// Location + role pool for dealing a round (server-side copy; the Lambda
// can't import from the Next.js app).
export interface GameLocation {
  name: string;
  roles: string[];
}

export const LOCATIONS: GameLocation[] = [
  { name: "Airplane", roles: ["First Class Passenger", "Air Marshal", "Mechanic", "Economy Class Passenger", "Stewardess", "Co-Pilot", "Captain"] },
  { name: "Bank", roles: ["Armored Car Driver", "Manager", "Consultant", "Robber", "Security Guard", "Teller", "Customer"] },
  { name: "Beach", roles: ["Beach Waitress", "Kite Surfer", "Lifeguard", "Thief", "Beach Goer", "Photographer", "Ice Cream Truck Driver"] },
  { name: "Cathedral", roles: ["Priest", "Beggar", "Sinner", "Tourist", "Sponsor", "Choir Singer", "Parishioner"] },
  { name: "Circus Tent", roles: ["Acrobat", "Animal Trainer", "Magician", "Visitor", "Fire Eater", "Clown", "Juggler"] },
  { name: "Corporate Party", roles: ["Entertainer", "Manager", "Unwelcome Guest", "Owner", "Secretary", "Accountant", "Delivery Boy"] },
  { name: "Crusader Army", roles: ["Monk", "Imprisoned Saracen", "Servant", "Bishop", "Squire", "Archer", "Knight"] },
  { name: "Casino", roles: ["Bartender", "Head Security Guard", "Bouncer", "Manager", "Hustler", "Dealer", "Gambler"] },
  { name: "Day Spa", roles: ["Stylist", "Masseuse", "Manicurist", "Makeup Artist", "Dermatologist", "Beautician", "Customer"] },
  { name: "Embassy", roles: ["Security Guard", "Secretary", "Ambassador", "Tourist", "Refugee", "Diplomat", "Government Official"] },
  { name: "Hospital", roles: ["Nurse", "Doctor", "Anesthesiologist", "Intern", "Patient", "Therapist", "Surgeon"] },
  { name: "Hotel", roles: ["Doorman", "Security Guard", "Manager", "Housekeeper", "Bartender", "Bellman", "Guest"] },
  { name: "Military Base", roles: ["Deserter", "Colonel", "Medic", "Soldier", "Sniper", "Officer", "Tank Engineer"] },
  { name: "Movie Studio", roles: ["Stuntman", "Sound Engineer", "Camera Man", "Director", "Costume Artist", "Actor", "Producer"] },
  { name: "Ocean Liner", roles: ["Rich Passenger", "Cook", "Captain", "Bartender", "Musician", "Waiter", "Mechanic"] },
  { name: "Passenger Train", roles: ["Mechanic", "Border Patrol", "Train Attendant", "Passenger", "Restaurant Chef", "Engineer", "Stoker"] },
  { name: "Pirate Ship", roles: ["Cook", "Sailor", "Slave", "Cannoneer", "Bound Prisoner", "Cabin Boy", "Brave Captain"] },
  { name: "Polar Station", roles: ["Medic", "Geologist", "Expedition Leader", "Biologist", "Radioman", "Hydrologist", "Meteorologist"] },
  { name: "Police Station", roles: ["Detective", "Lawyer", "Journalist", "Criminalist", "Archivist", "Patrol Officer", "Criminal"] },
  { name: "Restaurant", roles: ["Musician", "Customer", "Bouncer", "Hostess", "Head Chef", "Food Critic", "Waiter"] },
  { name: "School", roles: ["Gym Teacher", "Student", "Principal", "Security Guard", "Janitor", "Lunch Lady", "Maintenance Man"] },
  { name: "Service Station", roles: ["Manager", "Tire Specialist", "Biker", "Car Owner", "Car Wash Operator", "Electrician", "Auto Mechanic"] },
  { name: "Space Station", roles: ["Engineer", "Alien", "Pilot", "Commander", "Scientist", "Doctor", "Space Tourist"] },
  { name: "Submarine", roles: ["Cook", "Commander", "Sonar Technician", "Electronics Technician", "Sailor", "Radioman", "Navigator"] },
  { name: "Supermarket", roles: ["Customer", "Cashier", "Butcher", "Janitor", "Security Guard", "Food Sample Demonstrator", "Shelf Stocker"] },
  { name: "Theater", roles: ["Coat Check Lady", "Prompter", "Cashier", "Visitor", "Director", "Actor", "Crew Member"] },
  { name: "University", roles: ["Graduate Student", "Professor", "Dean", "Psychologist", "Maintenance Man", "Student", "Janitor"] },
];
