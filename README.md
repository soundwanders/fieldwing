# Fieldwing

## Description

Fieldwing is a web application powered by SvelteKit, designed to provide users with a comprehensive view of college football teams. Users can explore historical game results, head-to-head matchups, and select their favorite teams for in-depth analysis. Dive into the rich history of college football and gain insights into team performance over the years.

## Features

### Division Selection

- Users can select a college football division (FBS or FCS) from a dropdown list, or view all teams at once.
- A dropdown list selection dynamically populates the teams container, allowing user to scroll through and select their favorite teams.

### Week and Year Selection

- Users can choose the week and the year they wish to view the game results for, refining the search process and improving customization.
- A dropdown list selection dynamically populates the teams container, allowing user to scroll through and select their favorite teams.

### Team Selection

- The teams are displayed in a scrollable container to prevent any excessively long lists.
- Each team is presented as a clickable element. Select or de-select teams by clicking teams (or touching, if on a mobile device).
- A visual highlight is applied to the selected teams for clear identification.
- Teams are listed alphabetically, improving readability and user experience.

### Search for Player Statistics

- Users can customize their search with various criteria, including team, year, conference, start and end weeks, stat category, and season type.
- The player statistics are displayed via a table with sortable columns, enabling users to easily arrange data by player name, team, and various statistics.
- Each table header is a clickable button, allowing users to sort statistics in alphabetical, ascending or descending order depending on the data type.
- **Search Criteria:**
  - Team
  - Year
  - Conference
  - Start and End Weeks
  - Stat Category
  - Season Type

### Search for Team Statistics

- Users can customize their search with various criteria, including team, year, conference, start and end weeks.
- The team statistics are displayed via a table with sortable columns, allowing users to sort data in ascending or descending order.
- **Team Statistics Data Structure:**
  - Team
  - Year
  - Conference
  - Start and End Weeks
  - Stat Type
  - Stat Name

### Selected Teams Container

- A separate container displays the teams that the user has selected, for easy tracking of selected teams.
- The selected teams are listed in alphabetical order for easy reference.
- De-selecting teams remove them from this container.
- Choices in selected teams container will be used to fetch relevant data such as game results.

### Historical Head-to-Head Matchups

- Explore the historical head-to-head matchups between two selected teams.
- Navigate to the "Head-to-Head" page, where you can choose two teams and view their past matchups.
- Select two teams and input the date ranges you would like to explore, for example you can view all games from 2010 to 2020.
- Get insights into the performance of your favorite teams in their previous encounters.

## Accessibility

- Accessibility is important! Conscious effort to make our application screen-reader friendly.
- Interactive elements such as buttons and links are appropriately handled for keyboard and mouse users.
- Focus on proper use of semantic HTML, as well as ARIA to improve accessibility.

### Custom Theming

- Theme is tracked in a Svelte store as well as the use of localStorage if available.
- The application supports light and dark themes, allowing user to toggle their preferred theme.
- Theme changes are applied consistently throughout the UI for a cohesive user experience.
- Many design choices inspired by Tailwind CSS, such as font size and color palettes.

## Roadmap

- ~~Integration of additional features, such as data fetching from APIs~~
- Investigate user authentication and user profiles to allow users to manage and update their favorite teams.
- Implement testing with Vitest or a similar library.
- Create a Github Actions or similar workflow for testing and deployment on codebase updates.

## Getting Started

### Prerequisites

- Node.js and npm (or equivalent such as yarn, bun) installed on your PC or virtual machine.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/soundwanders/fieldwing.git
   ```

2. Navigate to the project directory:

   ```bash
   cd fieldwing
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

### Development

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open your browser and visit [http://localhost:5000](http://localhost:5000) to view the application.

## Credits

All icons and images are from **[FlatIcon](https://www.flaticon.com/)**

## Issues

If you encounter any issues or have suggestions, please open an issue on the [Issues](https://github.com/your-username/project-name/issues) page.

## License

This project is licensed under the [MIT License](LICENSE).
