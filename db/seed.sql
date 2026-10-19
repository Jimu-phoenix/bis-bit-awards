insert into categories (slug, title, blurb, sort_order) values
  ('most-likely-to-succeed', 'Most Likely to Succeed', 'The one we''ll all be saying ''I knew them back then'' about.', 1),
  ('code-wizard', 'Code Wizard', 'Ships at 3 a.m., debugs by vibes, never pushes to main on Fridays.', 2),
  ('best-final-year-project', 'Best Final-Year Project', 'The build that made the panel sit up straight.', 3),
  ('class-clown', 'Class Clown', 'Lectures were longer before they showed up. Better, too.', 4),
  ('best-dressed', 'Best Dressed', 'Fresh every single day, even on assignment deadlines.', 5),
  ('most-helpful', 'Most Helpful', 'Shared the notes, explained the code, saved the group project.', 6),
  ('finale-icon', 'Finale Icon', 'The face of BIS/BIT 2026. Period.', 7)
on conflict (slug) do nothing;

insert into nominees (category_id, name, blurb, sort_order) values
  ((select id from categories where slug = 'most-likely-to-succeed'), 'Aisha Malik', 'Top of the class, always helping others.', 1),
  ((select id from categories where slug = 'most-likely-to-succeed'), 'Brian Okonkwo', 'Consistent excellence in every project.', 2),
  ((select id from categories where slug = 'most-likely-to-succeed'), 'Chloe Banda', 'Natural leader with a brilliant mind.', 3),
  ((select id from categories where slug = 'code-wizard'), 'David Phiri', 'Debugs production at 3am like it''s nothing.', 1),
  ((select id from categories where slug = 'code-wizard'), 'Ellen Moyo', 'Writes elegant solutions to impossible problems.', 2),
  ((select id from categories where slug = 'code-wizard'), 'Farai Chanda', 'The one who fixes everyone''s merge conflicts.', 3),
  ((select id from categories where slug = 'best-final-year-project'), 'Grace Ngoma', 'Built an AI tutor that actually works.', 1),
  ((select id from categories where slug = 'best-final-year-project'), 'Henry Lungu', 'Full-stack masterpiece with zero bugs.', 2),
  ((select id from categories where slug = 'best-final-year-project'), 'Irene Sakala', 'IoT project that monitors campus water quality.', 3),
  ((select id from categories where slug = 'class-clown'), 'James Mwanza', 'Made the prof laugh during final presentations.', 1),
  ((select id from categories where slug = 'class-clown'), 'Katie Simwanza', 'Turned every bug into a meme.', 2),
  ((select id from categories where slug = 'class-clown'), 'Lucas Tembo', 'His commit messages are comedy gold.', 3),
  ((select id from categories where slug = 'best-dressed'), 'Maria Gondwe', 'Best dressed at every hackathon and lecture.', 1),
  ((select id from categories where slug = 'best-dressed'), 'Nathan Mwale', 'Always matching - even his laptop stickers.', 2),
  ((select id from categories where slug = 'best-dressed'), 'Olivia Chisenga', 'Campus fashion icon, period.', 3),
  ((select id from categories where slug = 'most-helpful'), 'Patrick Zulu', 'Wrote the unofficial course guide for everyone.', 1),
  ((select id from categories where slug = 'most-helpful'), 'Queen Daka', 'Saved three group projects this semester alone.', 2),
  ((select id from categories where slug = 'most-helpful'), 'Robert Kasongo', 'His Stack Overflow answers saved us all.', 3),
  ((select id from categories where slug = 'finale-icon'), 'Sandra Moyo', 'The face of BIS/BIT 2026 - voted by everyone.', 1),
  ((select id from categories where slug = 'finale-icon'), 'Thomas Banda', 'Campus legend, absolute icon.', 2),
  ((select id from categories where slug = 'finale-icon'), 'Vanessa Phiri', 'The one everyone will remember.', 3)
on conflict (category_id, name) do nothing;