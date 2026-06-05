// Location packs — themed sets the host can choose from.
import { LOCATIONS, type GameLocation } from "./locations";

export interface Pack {
  id: string;
  name: string;
  icon: string;
  locations: GameLocation[];
}

const SCIFI: GameLocation[] = [
  { name: "Starship Bridge", icon: "🛸", roles: ["Captain", "Navigator", "Comms Officer", "Engineer", "Android", "Science Officer", "Ensign"] },
  { name: "Alien Planet", icon: "👽", roles: ["Xenobiologist", "Drone Pilot", "Geologist", "Translator", "Marine", "Botanist", "Stranded Astronaut"] },
  { name: "Space Colony", icon: "🏙️", roles: ["Governor", "Hydroponics Farmer", "Air Recycler Tech", "Doctor", "Security Bot", "Miner", "Settler"] },
  { name: "Robot Factory", icon: "🤖", roles: ["Assembly Engineer", "QA Inspector", "Programmer", "Maintenance Droid", "Foreman", "Welder", "Saboteur"] },
  { name: "Time Machine Lab", icon: "⏳", roles: ["Chrononaut", "Physicist", "Paradox Analyst", "Intern", "Investor", "Janitor", "Historian"] },
  { name: "Asteroid Mine", icon: "☄️", roles: ["Drill Operator", "Foreman", "Ore Hauler", "Geologist", "Safety Officer", "Prospector", "Claim Jumper"] },
  { name: "Cryo Bay", icon: "❄️", roles: ["Cryo Technician", "Sleeping Colonist", "Ship Doctor", "Systems AI", "Security Guard", "Engineer", "Stowaway"] },
  { name: "Mars Base", icon: "🔴", roles: ["Commander", "Rover Driver", "Greenhouse Keeper", "Comms Officer", "Geologist", "Medic", "Tourist"] },
];

const OFFICE: GameLocation[] = [
  { name: "Open Office", icon: "🏢", roles: ["Intern", "Manager", "Developer", "Designer", "HR Rep", "Sales Rep", "New Hire"] },
  { name: "Boardroom", icon: "📊", roles: ["CEO", "Board Member", "Investor", "Note Taker", "Lawyer", "Consultant", "Whistleblower"] },
  { name: "Break Room", icon: "☕", roles: ["Barista", "Office Gossip", "Microwave Hog", "New Hire", "Janitor", "Birthday Celebrant", "Snack Thief"] },
  { name: "IT Department", icon: "💻", roles: ["Sysadmin", "Help Desk", "Network Engineer", "Security Analyst", "Intern", "CTO", "Cable Guy"] },
  { name: "Reception", icon: "🛎️", roles: ["Receptionist", "Visitor", "Courier", "Security Guard", "Job Candidate", "Lost Tourist", "Executive"] },
  { name: "Warehouse", icon: "📦", roles: ["Forklift Driver", "Packer", "Inventory Manager", "Loader", "Safety Inspector", "Truck Driver", "Thief"] },
  { name: "Coworking Space", icon: "🧑‍💻", roles: ["Freelancer", "Startup Founder", "Community Manager", "Barista", "Day Pass Guest", "Influencer", "Wi-Fi Leech"] },
  { name: "Call Center", icon: "🎧", roles: ["Agent", "Team Lead", "Trainer", "Angry Caller", "QA Listener", "IT Support", "Quitter"] },
];

const FANTASY: GameLocation[] = [
  { name: "Dragon's Lair", icon: "🐉", roles: ["Knight", "Dragon", "Treasure Hunter", "Wizard", "Captured Princess", "Squire", "Bard"] },
  { name: "Wizard Tower", icon: "🧙", roles: ["Archmage", "Apprentice", "Alchemist", "Familiar", "Librarian", "Summoned Demon", "Potion Tester"] },
  { name: "Enchanted Forest", icon: "🌲", roles: ["Druid", "Fairy", "Huntsman", "Talking Wolf", "Lost Child", "Witch", "Woodcutter"] },
  { name: "Royal Castle", icon: "🏰", roles: ["King", "Queen", "Court Jester", "Knight", "Servant", "Spy", "Royal Advisor"] },
  { name: "Tavern", icon: "🍺", roles: ["Barkeep", "Drunkard", "Bard", "Mercenary", "Pickpocket", "Traveler", "Cook"] },
  { name: "Dwarven Mine", icon: "⛏️", roles: ["Miner", "Foreman", "Blacksmith", "Gem Cutter", "Cave Explorer", "Mountain King", "Goblin Intruder"] },
  { name: "Elven Village", icon: "🏹", roles: ["Elder", "Archer", "Healer", "Tree Tender", "Visitor", "Scout", "Exiled Elf"] },
  { name: "Dungeon", icon: "🗝️", roles: ["Jailer", "Prisoner", "Torturer", "Rescuer", "Rat Catcher", "Escapee", "Ghost"] },
];

const SPOOKY: GameLocation[] = [
  { name: "Haunted Mansion", icon: "🏚️", roles: ["Ghost", "Medium", "Caretaker", "Investigator", "Heir", "Butler", "Trespasser"] },
  { name: "Graveyard", icon: "🪦", roles: ["Gravedigger", "Mourner", "Ghost", "Priest", "Grave Robber", "Caretaker", "Night Watchman"] },
  { name: "Witch's Coven", icon: "🧹", roles: ["High Priestess", "Apprentice Witch", "Familiar", "Potion Brewer", "Initiate", "Skeptic", "Black Cat"] },
  { name: "Abandoned Asylum", icon: "🏥", roles: ["Patient", "Doctor's Ghost", "Urban Explorer", "Nurse", "Orderly", "Escapee", "Film Crew"] },
  { name: "Crypt", icon: "⚰️", roles: ["Vampire", "Mummy", "Tomb Raider", "Archaeologist", "Cult Leader", "Lost Tourist", "Skeleton"] },
  { name: "Carnival of Horrors", icon: "🎪", roles: ["Clown", "Fortune Teller", "Ride Operator", "Lost Child", "Strongman", "Ticket Taker", "Escaped Beast"] },
  { name: "Werewolf Den", icon: "🐺", roles: ["Alpha", "Pup", "Hunter", "Lost Hiker", "Pack Healer", "Silver Smith", "Full Moon Tourist"] },
  { name: "Séance Room", icon: "🔮", roles: ["Medium", "Skeptic", "Grieving Widow", "Spirit", "Assistant", "Debunker", "Possessed Guest"] },
];

export const PACKS: Pack[] = [
  { id: "classic", name: "Classic", icon: "🕵️", locations: LOCATIONS },
  { id: "scifi", name: "Sci-Fi", icon: "🚀", locations: SCIFI },
  { id: "office", name: "Office", icon: "💼", locations: OFFICE },
  { id: "fantasy", name: "Fantasy", icon: "🐉", locations: FANTASY },
  { id: "spooky", name: "Spooky", icon: "👻", locations: SPOOKY },
];

export function packById(id: string | undefined): Pack {
  return PACKS.find((p) => p.id === id) ?? PACKS[0];
}
