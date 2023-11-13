# Fieldwing

## Description

Fieldwing is a web application built with SvelteKit, allowing users to seamlessly select their favorite college football teams and get weekly updates on their game results!

## Features

### Conference Selection

- Users can select a college football conference from a dropdown list, or view all FBS and FCS teams at once.
- A dropdown list selection dynamically populates the teams container, allowing user to scroll through and select their favorite teams.

### Team Selection

- The teams are displayed in a scrollable container to prevent any excessively long lists.
- Each team is presented as a clickable element. Select or de-select teams by clicking teams (or touching, if on a mobile device).
- A visual highlight is applied to the selected teams for clear identification.
- Teams are listed alphabetically, improving readability and user experience.

### Selected Teams Container

- A separate container displays the teams that the user has selected, for easy tracking of selected teams.
- The selected teams are listed in alphabetical order for easy reference.
- De-selecting teams remove them from this container.
- Choices in selected teams container will be used to fetch relevant data such as game results.

### Theming

- Theme is tracked in a Svelte `store` as well as the use of `localStorage`` if available.
- The application supports light and dark themes, allowing user to toggle their preferred theme.
- Theme changes are applied consistently throughout the UI for a cohesive user experience.

## Accessibility

- Accessibility is important! Conscious effort to make our application screen-reader friendly.
- Interactive elements such as buttons and links are appropriately handled for keyboard and mouse users.
- Focus on use of semantic HTML, as well as ARIA to provide additional semantics and improve accessibility.

## Aesthetic Design

- The UI design is intended to be modern, responsive, and visually appealing.
- Several design elements have been inspired by Tailwind.
- Aesthetic choices are intended to improve the overall user experience without over-complicating things.

## Roadmap

- Explore refinements to the UI and UX to create a unique, enjoyable experience
- Integration of additional features, such as data fetching from APIs.
- Investigate the feasability of user authentication and user profiles to allow users to manage and update their favorite teams.
- Implement unit testing with Vitest.
- Create a Github Actions or similar workflow for testing and deployment on codebase updates.

## Getting Started

### Prerequisites

- Node.js and npm installed on your PC or virtual machine.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/project-name.git
   ```

2. Navigate to the project directory:

   ```bash
   cd project-name
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

## Contribution

Contributions are welcome! Fork the repository and create a pull request with your enhancements.

## Issues

If you encounter any issues or have suggestions, please open an issue on the [Issues](https://github.com/your-username/project-name/issues) page.

## License

This project is licensed under the [MIT License](LICENSE).