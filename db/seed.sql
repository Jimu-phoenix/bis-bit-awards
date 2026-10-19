insert into categories (slug, title, blurb, sort_order) values
  ('most-likely-to-succeed', 'Most Likely to Succeed', 'The one we''ll all be saying ''I knew them back then'' about.', 1),
  ('code-wizard', 'Code Wizard', 'Ships at 3 a.m., debugs by vibes, never pushes to main on Fridays.', 2),
  ('best-final-year-project', 'Best Final-Year Project', 'The build that made the panel sit up straight.', 3),
  ('class-clown', 'Class Clown', 'Lectures were longer before they showed up. Better, too.', 4),
  ('best-dressed', 'Best Dressed', 'Fresh every single day, even on assignment deadlines.', 5),
  ('most-helpful', 'Most Helpful', 'Shared the notes, explained the code, saved the group project.', 6),
  ('finale-icon', 'Finale Icon', 'The face of BIS/BIT 2026. Period.', 7)
on conflict (slug) do nothing;
