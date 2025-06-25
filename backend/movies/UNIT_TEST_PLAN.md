# Unit Test Plan for Django Views

This document outlines the unit testing plan for the views in the `movies` app.

## `MoviesObject(APIView)`

### GET `/movies/`

-   **Test Case 1: No parameters**
    -   **Description:** Request movies without any query parameters.
    -   **Expected Result:** Should return a list of all movies in the database with a 200 status code.
-   **Test Case 2: Filter by `watched=false`**
    -   **Description:** Request movies that have not been watched.
    -   **Setup:** Create several movies, some associated with a `MovieNight` as `selected_movie` (watched) and some not.
    -   **Expected Result:** Should return only unwatched movies (`watched_movie__isnull=True`).
-   **Test Case 3: Filter by `watched=true`**
    -   **Description:** Request movies that have been watched.
    -   **Setup:** Create watched and unwatched movies.
    -   **Expected Result:** Should return only watched movies (`watched_movie__isnull=False`).
-   **Test Case 4: Request with `random=true`**
    -   **Description:** Request a random set of movies.
    -   **Expected Result:** Check that the query uses `order_by('?')`. Verify a 200 status and that the correct number of movies is returned.
-   **Test Case 5: Limit results with `limit=<number>`**
    -   **Description:** Limit the number of returned movies.
    -   **Setup:** Create more movies than the specified limit.
    -   **Expected Result:** The number of movies in the response should equal the limit.
-   **Test Case 6: Search with `search=<query>`**
    -   **Description:** Search for movies by title, user, or genre.
    -   **Setup:** Create movies with distinct titles, users, and genres.
    -   **Expected Result:** Should return only movies that match the search query.
-   **Test Case 7: Order results with `orderBy[type]=<field>` (ascending)**
    -   **Description:** Order movies by a specific field in ascending order.
    -   **Setup:** Create movies with varying values for the ordering field (e.g., `title`).
    -   **Expected Result:** Movies should be sorted by the specified field in ascending order.
-   **Test Case 8: Order results with `orderBy[type]=<field>&orderBy[ascending]=false` (descending)**
    -   **Description:** Order movies by a specific field in descending order.
    -   **Setup:** Create movies with varying values for the ordering field.
    -   **Expected Result:** Movies should be sorted by the specified field in descending order.
-   **Test Case 9: Combination of parameters**
    -   **Description:** Test with a combination of parameters (e.g., `watched=false`, `limit=5`, `orderBy[type]=title`).
    -   **Expected Result:** The result should respect all applied filters and ordering.
-   **Test Case 10: No movies in database**
    -   **Description:** Request movies when the database contains no movies.
    -   **Expected Result:** Should return an empty list `[]` with a 200 status code.

### POST `/movies/`

-   **Test Case 1: Valid movie data and user with tickets**
    -   **Description:** An authenticated user with sufficient tickets adds a new movie.
    -   **Setup:** Create and authenticate a user with `tickets > 0`.
    -   **Expected Result:** A 200 status code, the movie is created, and the user's ticket count is decremented.
-   **Test Case 2: User with no tickets**
    -   **Description:** A user with 0 tickets attempts to add a new movie.
    -   **Setup:** Create and authenticate a user with `tickets = 0`.
    -   **Expected Result:** A 402 status code with the error message `{'error': 'not enough tickets'}`. The movie should not be created.
-   **Test Case 3: Invalid or incomplete movie data**
    -   **Description:** The request body is missing required fields for the `Movie` model.
    -   **Expected Result:** A 400 status code with the error message `{'error': 'out of field'}`. The movie should not be created.
-   **Test Case 4: Unauthenticated user**
    -   **Description:** An unauthenticated user attempts to add a movie.
    -   **Expected Result:** A 403 Forbidden status code.

## `AverageRatings(APIView)`

### GET `/ratings/average/`

-   **Test Case 1: Movies with ratings**
    -   **Description:** Get average ratings for movies that have been rated.
    -   **Setup:** Create movies and add multiple ratings for each.
    -   **Expected Result:** A list of objects, each containing movie details and the correct calculated average rating.
-   **Test Case 2: Movies with no ratings**
    -   **Description:** Some movies have not been rated.
    -   **Setup:** Create movies, adding ratings for only some of them.
    -   **Expected Result:** The response should only include movies that have at least one rating.
-   **Test Case 3: No movies in database**
    -   **Description:** There are no movies in the database.
    -   **Expected Result:** An empty list `[]`.
-   **Test Case 4: Unauthenticated access**
    -   **Description:** View is public, so no authentication is needed.
    -   **Expected Result:** 200 OK.

## `RateAPI(APIView)`

### GET `/ratings/`

-   **Test Case 1: Get all ratings**
    -   **Description:** Request all existing ratings.
    -   **Setup:** Create users, movies, and ratings.
    -   **Expected Result:** A list of all ratings, with details about the movie and user for each.
-   **Test Case 2: No ratings in database**
    -   **Description:** There are no ratings in the database.
    -   **Expected Result:** An empty list `[]`.

### POST `/ratings/`

-   **Test Case 1: Valid rating data**
    -   **Description:** An authenticated user submits a valid rating for a movie.
    -   **Setup:** Create and authenticate a user and create a movie.
    -   **Expected Result:** A 200 status code, and the rating is created in the database.
-   **Test Case 2: Rating a non-existent movie**
    -   **Description:** A user tries to rate a movie that does not exist.
    -   **Expected Result:** A 500 Internal Server Error due to an unhandled `Movie.DoesNotExist` exception.
-   **Test Case 3: Incomplete data**
    -   **Description:** The request is missing fields such as `rating`.
    -   **Expected Result:** A 400 status code.
-   **Test Case 4: Unauthenticated user**
    -   **Description:** An unauthenticated user attempts to submit a rating.
    -   **Expected Result:** A 403 Forbidden status code.
-   **Test Case 5: User rating the same movie twice**
    -   **Description:** A user tries to rate a movie they have already rated.
    -   **Setup:** Create a user, a movie, and a rating for that movie by the user.
    -   **Expected Result:** A 500 Internal Server Error due to an unhandled `IntegrityError` from the `unique_movie_user_rating` constraint.

## `Night(APIView)`

### GET `/night/`

-   **Test Case 1: Get all nights**
    -   **Description:** An authenticated user requests all movie nights without any parameters.
    -   **Setup:** Create multiple `MovieNight` objects.
    -   **Expected Result:** A list of all movie nights.
-   **Test Case 2: Get a specific night by date**
    -   **Description:** Request a movie night for a specific date using the `date` query parameter.
    -   **Setup:** Create a `MovieNight` on a known date.
    -   **Expected Result:** Details of the movie night for that specific date.
-   **Test Case 3: Get a night for a date that does not exist**
    -   **Description:** Request a movie night for a date where no night is scheduled.
    -   **Expected Result:** A 500 error due to `MovieNight.DoesNotExist`.
-   **Test Case 4: Unauthenticated user**
    -   **Description:** An unauthenticated user tries to get movie nights.
    -   **Expected Result:** A 403 Forbidden status code.

### POST `/night/`

-   **Test Case 1: Valid movie night data**
    -   **Description:** An authenticated user creates a new movie night.
    -   **Setup:** Authenticate a user.
    -   **Expected Result:** A 200 status code, a new `MovieNight` is created, the host is added to `Attendees`, and the host's ticket count is increased by 2.
-   **Test Case 2: Movie night on an existing date**
    -   **Description:** A user tries to create a movie night on a date that already has one.
    -   **Setup:** Create a `MovieNight` for a specific date.
    -   **Expected Result:** A 400 status code with the error message `{'error': 'A MovieNight already exists for this date.'}`.
-   **Test Case 3: Incomplete data**
    -   **Description:** The request is missing required fields.
    -   **Expected Result:** A 400 status code with the error message `{'error': 'out of field'}`.
-   **Test Case 4: Unauthenticated user**
    -   **Description:** An unauthenticated user tries to create a movie night.
    -   **Expected Result:** A 403 Forbidden status code.

## `AttendeesView(APIView)`

### GET `/attendees/`

-   **Test Case 1: Get all attendees**
    -   **Description:** An authenticated user requests the list of all attendees for all nights.
    -   **Setup:** Create movie nights, users, and add users as attendees.
    -   **Expected Result:** A list of all attendees with their details.
-   **Test Case 2: No attendees**
    -   **Description:** Request attendees when none exist.
    -   **Expected Result:** An empty list `[]`.
-   **Test Case 3: Unauthenticated user**
    -   **Description:** An unauthenticated user requests attendees.
    -   **Expected Result:** A 403 Forbidden status code.

### POST `/attendees/`

-   **Test Case 1: Valid attendee data**
    -   **Description:** An authenticated user successfully joins a movie night.
    -   **Setup:** Create a user and a movie night. Authenticate the user.
    -   **Expected Result:** A 200 status code, a new `Attendees` record is created, and the user's ticket count is incremented by 1.
-   **Test Case 2: Joining a non-existent night**
    -   **Description:** A user tries to join a movie night that does not exist.
    -   **Expected Result:** A 500 error due to `MovieNight.DoesNotExist`.
-   **Test Case 3: User joining the same night twice**
    -   **Description:** A user attempts to join a movie night they are already attending.
    -   **Setup:** Add a user to a movie night.
    -   **Expected Result:** A 500 error due to `IntegrityError` from the `unique_night_user_attendee` constraint.
-   **Test Case 4: Unauthenticated user**
    -   **Description:** An unauthenticated user attempts to join a night.
    -   **Expected Result:** A 403 Forbidden status code.

## `Login(APIView)`

### POST `/login/`

-   **Test Case 1: Valid credentials**
    -   **Description:** A user logs in with a correct username and password.
    -   **Setup:** Create a user.
    -   **Expected Result:** A 200 status code and a session is created for the user.
-   **Test Case 2: Invalid credentials**
    -   **Description:** A user attempts to log in with an incorrect password.
    -   **Expected Result:** A 401 status code with the error `{'error': 'Invalid credentials'}`.
-   **Test Case 3: Non-existent user**
    -   **Description:** Attempting to log in with a username that does not exist.
    -   **Expected Result:** A 401 status code with the error `{'error': 'Invalid credentials'}`.
-   **Test Case 4: Missing credentials**
    -   **Description:** The login request is missing the username or password.
    -   **Expected Result:** A 400 status code.

## `Logout(APIView)`

### POST `/logout/`

-   **Test Case 1: Authenticated user logs out**
    -   **Description:** A logged-in user posts to the logout endpoint.
    -   **Setup:** Log in a user.
    -   **Expected Result:** A 200 status code and the user's session is terminated.
-   **Test Case 2: Unauthenticated user attempts to log out**
    -   **Description:** A request is sent to the logout endpoint without an active session.
    -   **Expected Result:** A 403 Forbidden status code.

## `user_register` (function-based view)

### POST `/register/`

-   **Test Case 1: Valid registration with correct answer**
    -   **Description:** A new user registers with a unique username, a password, and the correct answer to the daily question.
    -   **Setup:** Create a `RegisterQuestion` for the current day.
    -   **Expected Result:** A 200 status code and a new user is created.
-   **Test Case 2: Existing username**
    -   **Description:** A user tries to register with a username that is already taken.
    -   **Setup:** Create a user.
    -   **Expected Result:** A 400 status code with the error `{'error': 'USER ALREADY EXISTS'}`.
-   **Test Case 3: Incorrect answer to security question**
    -   **Description:** The provided answer to the registration question is incorrect.
    -   **Expected Result:** A 400 status code with the error `{'error': 'BAD ANSWER'}`.
-   **Test Case 4: Rate limiting**
    -   **Description:** Test the rate limit decorator (`3/d`).
    -   **Expected Result:** After 3 registration attempts from the same IP, subsequent requests should be blocked (429 status code).
-   **Test Case 5: Non-POST request**
    -   **Description:** Send a GET request to the register endpoint.
    -   **Expected Result:** A 405 Method Not Allowed status code.

## `UserPassword(APIView)`

### POST `/user/<username>/password/`

-   **Test Case 1: Successful password change**
    -   **Description:** An authenticated user changes their password by providing the correct old password.
    -   **Setup:** Log in a user.
    -   **Expected Result:** A 200 status code and the user's password is updated.
-   **Test Case 2: Incorrect old password**
    -   **Description:** The user provides an incorrect old password.
    -   **Expected Result:** A 400 status code with the error `{'error': 'Wrong password provided'}`.
-   **Test Case 3: Changing password for another user**
    -   **Description:** An authenticated user attempts to change the password of another user. This should be prevented by checking if the authenticated user matches the `username` in the URL.
    -   **Setup:** Log in as `user_A`, attempt to change `user_B`'s password.
    -   **Expected Result:** A 403 Forbidden status code.
-   **Test Case 4: Unauthenticated access**
    -   **Description:** An unauthenticated user tries to change a password.
    -   **Expected Result:** A 403 Forbidden status code.

## `RandMovie(APIView)`

### GET `/randmovie/`

-   **Test Case 1: Successful random movie selection**
    -   **Description:** A random movie is selected for an upcoming movie night.
    -   **Setup:** Create an upcoming `MovieNight` (date in the future, `selected_movie=None`). Create several unwatched movies. Set the time to be within 10 seconds of the movie night date.
    -   **Expected Result:** A 200 status code with the selected movie's details. The `selected_movie` field of the `MovieNight` is updated.
-   **Test Case 2: No upcoming nights**
    -   **Description:** The endpoint is called when there are no upcoming movie nights.
    -   **Expected Result:** An empty list `[]` with a 200 status code.
-   **Test Case 3: Too early to select a movie**
    -   **Description:** The random selection is attempted more than 10 seconds before the movie night.
    -   **Setup:** Set the `night_date` to be far in the future.
    -   **Expected Result:** A 425 Too Early status code with `{'error': 'Too soon, try again later'}`.
-   **Test Case 4: No unwatched movies available**
    -   **Description:** All movies in the database have already been watched.
    -   **Setup:** Create an upcoming `MovieNight` but mark all existing movies as watched.
    -   **Expected Result:** An empty list `[]` with a 200 status code.

## `Avatar(APIView)`

### GET `/avatar/<username>/`

-   **Test Case 1: Get avatar for existing user with avatar**
    -   **Description:** An authenticated user requests the avatar for a user who has one.
    -   **Setup:** Create a user and upload an avatar for them.
    -   **Expected Result:** A 200 status code with a JSON response containing the avatar URL, like `{'avatar_url': '...'}`.
-   **Test Case 2: Get avatar for user without an avatar**
    -   **Description:** Request an avatar for a user who has not uploaded one.
    -   **Setup:** Create a user without an avatar.
    -   **Expected Result:** A 200 status code with an empty avatar URL: `{'avatar_url': ''}`.
-   **Test Case 3: Get avatar for non-existent user**
    -   **Description:** Request an avatar for a user that does not exist.
    -   **Expected Result:** A 404 Not Found status code.
-   **Test Case 4: Unauthenticated access**
    -   **Description:** An unauthenticated user attempts to get an avatar.
    -   **Expected Result:** A 403 Forbidden status code.

### POST `/avatar/<username>/`

-   **Test Case 1: Successfully upload a new avatar**
    -   **Description:** An authenticated user uploads a new avatar, replacing an old one.
    -   **Setup:** Log in a user who already has an avatar.
    -   **Expected Result:** A 200 status code, the new avatar is saved, and the old avatar file is deleted.
-   **Test Case 2: Upload avatar for the first time**
    -   **Description:** A user uploads their first avatar.
    -   **Setup:** Log in a user who has no avatar.
    -   **Expected Result:** A 200 status code and the new avatar is saved.
-   **Test Case 3: Uploading for another user**
    -   **Description:** An authenticated user tries to upload an avatar for another user. The view logic should prevent this.
    -   **Setup:** Log in as `user_A` and try to post to `/avatar/user_B/`.
    -   **Expected Result:** A 403 Forbidden status code (or similar, depending on implementation).
-   **Test Case 4: Unauthenticated upload**
    -   **Description:** An unauthenticated user attempts to upload an avatar.
    -   **Expected Result:** A 403 Forbidden status code.

## `UserStatistics(APIView)`

### GET `/statistics/<username>/`

-   **Test Case 1: Get statistics for an existing user**
    -   **Description:** An authenticated user requests statistics for a user with activity.
    -   **Setup:** Create a user, have them host movie nights, add movies, and receive ratings.
    -   **Expected Result:** A 200 status code with a JSON object containing correct statistics (`added_movies`, `watched_movies`, etc.).
-   **Test Case 2: Get statistics for a new user with no activity**
    -   **Description:** Request statistics for a user who has just signed up.
    -   **Setup:** Create a new user with no associated movies, nights, or ratings.
    -   **Expected Result:** A 200 status code with zero values for all stats, except for the default `movie_tickets`.
-   **Test Case 3: Get statistics for a non-existent user**
    -   **Description:** Request statistics for a username that does not exist.
    -   **Expected Result:** A 404 Not Found status code.
-   **Test Case 4: Unauthenticated access**
    -   **Description:** An unauthenticated user attempts to get statistics.
    -   **Expected Result:** A 403 Forbidden status code.

## `RegisterQuestions(APIView)`

### GET `/register/question/`

-   **Test Case 1: Get the question for the current day**
    -   **Description:** Request the registration question.
    -   **Setup:** Ensure there is a `RegisterQuestion` object for the current day of the week in the database.
    -   **Expected Result:** A 200 status code with a JSON object like `{"question": "..."}`.
-   **Test Case 2: No question for the current day**
    -   **Description:** Request the question when no question is set for the current day.
    -   **Expected Result:** A 500 error due to `RegisterQuestion.DoesNotExist`.

## `MovieDate(APIView)`

### GET `/movie-date/`

-   **Test Case 1: Upcoming night exists**
    -   **Description:** Request the date of the next movie night when one is scheduled.
    -   **Setup:** Create a `MovieNight` in the future with `selected_movie=None`.
    -   **Expected Result:** A 200 status code with the date of the next movie night.
-   **Test Case 2: No upcoming nights**
    -   **Description:** Request the movie date when no future nights are scheduled.
    -   **Expected Result:** An empty list `[]` with a 200 status code.
-   **Test Case 3: Upcoming night has a selected movie**
    -   **Description:** Request the date when the next upcoming night already has a movie selected.
    -   **Setup:** Create a future `MovieNight` and assign a `selected_movie` to it.
    -   **Expected Result:** The view's logic filters for `selected_movie__isnull=True`, so it should return an empty list `[]`.

## `UpcomingNights(APIView)`

### GET `/upcoming-nights/`

-   **Test Case 1: An upcoming night exists**
    -   **Description:** Check if there is an upcoming movie night that needs a movie.
    -   **Setup:** Create a `MovieNight` in the future with `selected_movie=None`.
    -   **Expected Result:** A 200 status code with the response `True`.
-   **Test Case 2: No upcoming nights**
    -   **Description:** Check for upcoming nights when none are scheduled.
    -   **Expected Result:** A 200 status code with the response `False`.
-   **Test Case 3: Upcoming night already has a movie**
    -   **Description:** Check for upcoming nights when the next one already has a movie selected.
    -   **Setup:** Create a future `MovieNight` and assign a `selected_movie` to it.
    -   **Expected Result:** A 200 status code with the response `False`, as the view filters for nights where `selected_movie` is null. 