// Fix old stories that have 'author' field instead of 'authorId'

db = db.getSiblingDB('nahb');

// Find stories with 'author' field
const storiesWithAuthor = db.stories.find({ author: { $exists: true } }).toArray();

print(`Found ${storiesWithAuthor.length} stories with 'author' field`);

storiesWithAuthor.forEach(story => {
  print(`Updating story: ${story.title}`);
  print(`  Old author: ${story.author}`);
  
  // Convert ObjectId to string for authorId
  const authorId = story.author.toString();
  
  db.stories.updateOne(
    { _id: story._id },
    { 
      $set: { authorId: authorId },
      $unset: { author: "" }
    }
  );
  
  print(`  New authorId: ${authorId}`);
});

print('Done!');
