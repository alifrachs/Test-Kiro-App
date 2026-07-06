# Requirements Document

## Introduction

A club soccer profile website built with HTML5, Tailwind CSS, and Vanilla JavaScript. The website serves as the official digital presence for a soccer club, providing fans and visitors with information about match schedules, an online seat ticketing reservation system with three ticket categories (Normal, VIP, and Kids), and a dedicated page showcasing the club's squad and coaching staff.

## Glossary

- **Website**: The club soccer profile web application consisting of multiple pages
- **Visitor**: Any user browsing the website
- **Match_Schedule_Page**: The page displaying upcoming and past match information
- **Ticket_Reservation_System**: The frontend component handling seat selection and booking
- **Squad_Page**: The page displaying player and coach profiles
- **Normal_Ticket**: Standard seating category with base pricing
- **VIP_Ticket**: Premium seating category with enhanced benefits
- **Kids_Ticket**: Discounted seating category for children
- **Reservation_Form**: The form component used to collect booking details from a Visitor
- **Navigation**: The global navigation bar linking all pages

## Requirements

### Requirement 1: Global Navigation and Layout (REFINED)

**User Story:** As a Visitor, I want to navigate between pages easily, so that I can access match schedules, ticketing, and squad information from anywhere on the website.

#### Acceptance Criteria

1. THE Website SHALL display a Navigation bar visible on all pages containing links to the Home, Match Schedule, Ticket Reservation, and Squad pages.
2. THE Website SHALL render correctly on desktop (≥1024px), tablet (768px–1023px), and mobile (≤767px) screen widths without horizontal scrolling or layout overflow.
3. WHEN a Visitor clicks a Navigation link, THE Website SHALL navigate to the corresponding page without a full page reload within 2 seconds.
4. THE Navigation SHALL highlight the currently active page link using a visible indicator (e.g., underline, highlight, or bold) and this indicator SHALL persist without requiring further interaction.
5. WHEN the Website is viewed at a screen width of ≤767px, THE Navigation SHALL collapse into a toggle menu (e.g., hamburger icon), and WHEN the Visitor activates the toggle, THE Navigation SHALL expand to show all page links.

---

### Requirement 2: Match Schedule Page (REFINED)

**User Story:** As a Visitor, I want to view the club's match schedule, so that I can plan attendance at upcoming games.

#### Acceptance Criteria

1. THE Match_Schedule_Page SHALL display a list of matches, each showing the home team, away team, match date (formatted as DD/MM/YYYY), match time (formatted as HH:MM in 24-hour format), and venue.
2. THE Match_Schedule_Page SHALL visually distinguish between upcoming matches (match date/time is on or after the current date/time) and past matches (match date/time is before the current date/time) by applying a consistent visual style indicator (e.g., different background color or label) to each entry.
3. WHEN a match has a corresponding ticket reservation available, THE Match_Schedule_Page SHALL display a "Buy Ticket" button linked to the Ticket Reservation page for that match.
4. IF no matches are available in the schedule data, THEN THE Match_Schedule_Page SHALL display an empty state message informing the Visitor that no matches are currently scheduled.
5. THE Match_Schedule_Page SHALL display matches sorted in ascending chronological order by match date, then by match time as a secondary sort key for same-day matches.
6. IF the schedule data fails to load due to an error, THEN THE Match_Schedule_Page SHALL display an error message distinguishing the failure from an empty schedule.

---

### Requirement 3: Ticket Reservation — Seat Category Selection (REFINED)

**User Story:** As a Visitor, I want to choose from different seat categories, so that I can select a ticket type that fits my preference and budget.

#### Acceptance Criteria

1. THE Ticket_Reservation_System SHALL display three ticket categories: Normal, VIP, and Kids, each showing the category name, price, and a description of included benefits not exceeding 150 characters.
2. WHEN a Visitor selects a ticket category, THE Ticket_Reservation_System SHALL visually mark the selected category as active and deselect any previously selected category within 300ms.
3. THE Normal_Ticket SHALL have a base price that is less than or equal to the VIP_Ticket price and less than or equal to the Kids_Ticket price, and SHALL NOT exceed either at any time regardless of demand conditions.
4. THE VIP_Ticket SHALL display at least one benefit that is not available on the Normal_Ticket or Kids_Ticket (e.g., priority entry, lounge access).
5. THE Kids_Ticket SHALL specify that it is for children under 12 years of age in its description.
6. IF a Visitor attempts to proceed without selecting a ticket category, THEN THE Ticket_Reservation_System SHALL display a validation error prompting the Visitor to select a category and SHALL NOT advance to the next step.
7. WHEN a Visitor navigates back to the category selection step after previously selecting a category, THE Ticket_Reservation_System SHALL restore and display the previously selected category as active.

---

### Requirement 4: Ticket Reservation — Booking Form (REFINED)

**User Story:** As a Visitor, I want to fill in my details and submit a reservation, so that I can secure my seat for a match.

#### Acceptance Criteria

1. THE Reservation_Form SHALL collect the Visitor's full name (maximum 100 characters), email address (maximum 254 characters), phone number (maximum 20 characters), selected match, ticket category, and number of seats (minimum 1, maximum 10).
2. WHEN a Visitor submits the Reservation_Form with all required fields correctly filled, THE Ticket_Reservation_System SHALL display a booking confirmation summary showing the Visitor's name, selected match, ticket category, number of seats, and total price.
3. IF a Visitor submits the Reservation_Form with one or more empty required fields, THEN THE Reservation_Form SHALL display an inline validation error beside each empty field and SHALL NOT submit the form.
4. IF a Visitor enters an invalid email format, THEN THE Reservation_Form SHALL display a validation error message on the email field and SHALL NOT submit the form.
5. WHEN a Visitor changes the number of seats or ticket category, THE Reservation_Form SHALL recalculate and display the updated total price within 1 second.
6. WHEN the booking confirmation is displayed, THE Ticket_Reservation_System SHALL provide a "Book Another Ticket" action that resets the Reservation_Form to its default empty or unselected state.
7. IF a Visitor enters a phone number containing characters other than digits, spaces, hyphens, or a leading plus sign, THEN THE Reservation_Form SHALL display a validation error on the phone number field and SHALL NOT submit the form.
8. IF a Visitor selects a number of seats that exceeds the remaining available capacity for the selected match, THEN THE Reservation_Form SHALL display a validation error indicating insufficient availability and SHALL NOT submit the form.

---

### Requirement 5: Squad and Coaches Page (REFINED)

**User Story:** As a Visitor, I want to see information about the club's players and coaching staff, so that I can learn about the team.

#### Acceptance Criteria

1. THE Squad_Page SHALL display a list of players, each showing the player's name, jersey number (between 1 and 99 inclusive), position, and profile photo.
2. THE Squad_Page SHALL display a list of coaches, each showing the coach's name, role (e.g., Head Coach, Assistant Coach), and profile photo.
3. THE Squad_Page SHALL display the players section before the coaches section, with each section identified by a distinct, labeled section heading.
4. IF a player or coach profile photo is unavailable, THEN THE Squad_Page SHALL display a placeholder avatar image in place of the missing photo.
5. THE Squad_Page SHALL group players by their position category in the following order: Goalkeepers, Defenders, Midfielders, Forwards, with a labeled group heading for each category.
6. IF no player data is available, THEN THE Squad_Page SHALL display an empty state message in the players section indicating no players are currently listed.
7. IF no coach data is available, THEN THE Squad_Page SHALL display an empty state message in the coaches section indicating no coaches are currently listed.

---

### Requirement 6: Responsive Design and Accessibility (REFINED)

**User Story:** As a Visitor, I want the website to be accessible and readable on any device, so that I can comfortably browse on my phone, tablet, or computer.

#### Acceptance Criteria

1. THE Website SHALL use semantic HTML5 elements (e.g., `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`) throughout all pages.
2. THE Website SHALL provide a non-empty `alt` attribute on all informational `<img>` elements describing the image content, and SHALL provide an empty `alt=""` attribute on all decorative `<img>` elements.
3. THE Website SHALL achieve a color contrast ratio of at least 4.5:1 between foreground text and background colors for normal text (below 18pt or 14pt bold), in accordance with WCAG 2.1 AA guidelines.
4. THE Website SHALL achieve a color contrast ratio of at least 3:1 between foreground text and background colors for large text (18pt or above, or 14pt bold or above), in accordance with WCAG 2.1 AA guidelines.
5. WHEN a Visitor navigates the website using only a keyboard, THE Website SHALL maintain a visible focus indicator of at least 2px outline on all interactive elements.
6. WHERE a Visitor uses a pointer device (mouse or touch), THE Website MAY hide the focus indicator on interactive elements.
7. WHEN the Website is viewed at a screen width between 320px and 767px inclusive, THE Website SHALL render all content in a single-column layout without horizontal scrolling.
8. WHEN the Website is viewed at a screen width between 768px and 1279px inclusive, THE Website SHALL render content in a multi-column layout without horizontal scrolling.
9. THE Website SHALL use Tailwind CSS utility classes for all layout and styling, with no separate custom CSS file required for core layout.
