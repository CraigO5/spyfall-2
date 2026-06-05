// Server-side pack data (names + roles) for dealing. Must stay in sync with
// app/data/packs.ts (same ids + location names).
import { LOCATIONS, type GameLocation } from "./locations";

export interface Pack {
  id: string;
  locations: GameLocation[];
}

const SCIFI: GameLocation[] = [
  { name: "Starship Bridge", roles: ["Captain", "Navigator", "Comms Officer", "Engineer", "Android", "Science Officer", "Ensign"] },
  { name: "Alien Planet", roles: ["Xenobiologist", "Drone Pilot", "Geologist", "Translator", "Marine", "Botanist", "Stranded Astronaut"] },
  { name: "Space Colony", roles: ["Governor", "Hydroponics Farmer", "Air Recycler Tech", "Doctor", "Security Bot", "Miner", "Settler"] },
  { name: "Robot Factory", roles: ["Assembly Engineer", "QA Inspector", "Programmer", "Maintenance Droid", "Foreman", "Welder", "Saboteur"] },
  { name: "Time Machine Lab", roles: ["Chrononaut", "Physicist", "Paradox Analyst", "Intern", "Investor", "Janitor", "Historian"] },
  { name: "Asteroid Mine", roles: ["Drill Operator", "Foreman", "Ore Hauler", "Geologist", "Safety Officer", "Prospector", "Claim Jumper"] },
  { name: "Cryo Bay", roles: ["Cryo Technician", "Sleeping Colonist", "Ship Doctor", "Systems AI", "Security Guard", "Engineer", "Stowaway"] },
  { name: "Mars Base", roles: ["Commander", "Rover Driver", "Greenhouse Keeper", "Comms Officer", "Geologist", "Medic", "Tourist"] },
];

const OFFICE: GameLocation[] = [
  { name: "Open Office", roles: ["Intern", "Manager", "Developer", "Designer", "HR Rep", "Sales Rep", "New Hire"] },
  { name: "Boardroom", roles: ["CEO", "Board Member", "Investor", "Note Taker", "Lawyer", "Consultant", "Whistleblower"] },
  { name: "Break Room", roles: ["Barista", "Office Gossip", "Microwave Hog", "New Hire", "Janitor", "Birthday Celebrant", "Snack Thief"] },
  { name: "IT Department", roles: ["Sysadmin", "Help Desk", "Network Engineer", "Security Analyst", "Intern", "CTO", "Cable Guy"] },
  { name: "Reception", roles: ["Receptionist", "Visitor", "Courier", "Security Guard", "Job Candidate", "Lost Tourist", "Executive"] },
  { name: "Warehouse", roles: ["Forklift Driver", "Packer", "Inventory Manager", "Loader", "Safety Inspector", "Truck Driver", "Thief"] },
  { name: "Coworking Space", roles: ["Freelancer", "Startup Founder", "Community Manager", "Barista", "Day Pass Guest", "Influencer", "Wi-Fi Leech"] },
  { name: "Call Center", roles: ["Agent", "Team Lead", "Trainer", "Angry Caller", "QA Listener", "IT Support", "Quitter"] },
];

const FANTASY: GameLocation[] = [
  { name: "Dragon's Lair", roles: ["Knight", "Dragon", "Treasure Hunter", "Wizard", "Captured Princess", "Squire", "Bard"] },
  { name: "Wizard Tower", roles: ["Archmage", "Apprentice", "Alchemist", "Familiar", "Librarian", "Summoned Demon", "Potion Tester"] },
  { name: "Enchanted Forest", roles: ["Druid", "Fairy", "Huntsman", "Talking Wolf", "Lost Child", "Witch", "Woodcutter"] },
  { name: "Royal Castle", roles: ["King", "Queen", "Court Jester", "Knight", "Servant", "Spy", "Royal Advisor"] },
  { name: "Tavern", roles: ["Barkeep", "Drunkard", "Bard", "Mercenary", "Pickpocket", "Traveler", "Cook"] },
  { name: "Dwarven Mine", roles: ["Miner", "Foreman", "Blacksmith", "Gem Cutter", "Cave Explorer", "Mountain King", "Goblin Intruder"] },
  { name: "Elven Village", roles: ["Elder", "Archer", "Healer", "Tree Tender", "Visitor", "Scout", "Exiled Elf"] },
  { name: "Dungeon", roles: ["Jailer", "Prisoner", "Torturer", "Rescuer", "Rat Catcher", "Escapee", "Ghost"] },
];

const SPOOKY: GameLocation[] = [
  { name: "Haunted Mansion", roles: ["Ghost", "Medium", "Caretaker", "Investigator", "Heir", "Butler", "Trespasser"] },
  { name: "Graveyard", roles: ["Gravedigger", "Mourner", "Ghost", "Priest", "Grave Robber", "Caretaker", "Night Watchman"] },
  { name: "Witch's Coven", roles: ["High Priestess", "Apprentice Witch", "Familiar", "Potion Brewer", "Initiate", "Skeptic", "Black Cat"] },
  { name: "Abandoned Asylum", roles: ["Patient", "Doctor's Ghost", "Urban Explorer", "Nurse", "Orderly", "Escapee", "Film Crew"] },
  { name: "Crypt", roles: ["Vampire", "Mummy", "Tomb Raider", "Archaeologist", "Cult Leader", "Lost Tourist", "Skeleton"] },
  { name: "Carnival of Horrors", roles: ["Clown", "Fortune Teller", "Ride Operator", "Lost Child", "Strongman", "Ticket Taker", "Escaped Beast"] },
  { name: "Werewolf Den", roles: ["Alpha", "Pup", "Hunter", "Lost Hiker", "Pack Healer", "Silver Smith", "Full Moon Tourist"] },
  { name: "Séance Room", roles: ["Medium", "Skeptic", "Grieving Widow", "Spirit", "Assistant", "Debunker", "Possessed Guest"] },
];

const PACKS: Pack[] = [
  { id: "classic", locations: LOCATIONS },
  { id: "scifi", locations: SCIFI },
  { id: "office", locations: OFFICE },
  { id: "fantasy", locations: FANTASY },
  { id: "spooky", locations: SPOOKY },
];

export function packById(id: string | undefined): Pack {
  return PACKS.find((p) => p.id === id) ?? PACKS[0];
}
