/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const { execSync } = require('child_process');

const TRACKER_FILE = '.commit-tracker.json';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadTracker() {
    if (fs.existsSync(TRACKER_FILE)) {
        return JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf-8'));
    }
    return {
        currentDate: new Date('2026-06-11T10:00:00Z').getTime(),
        commitsToday: 0,
        targetCommitsToday: getRandomInt(3, 9),
        daysPassed: 0,
        log: {}
    };
}

function saveTracker(data) {
    fs.writeFileSync(TRACKER_FILE, JSON.stringify(data, null, 2));
}

function getNextDate(tracker) {
    tracker.commitsToday++;
    
    if (tracker.commitsToday > tracker.targetCommitsToday) {
        let daysToAdvance = 1;
        tracker.daysPassed++;
        
        if (tracker.daysPassed % getRandomInt(3, 4) === 0) {
            daysToAdvance += 1;
        }
        
        tracker.currentDate += daysToAdvance * 24 * 60 * 60 * 1000;
        tracker.commitsToday = 1;
        tracker.targetCommitsToday = getRandomInt(3, 9);
    }
    
    const d = new Date(tracker.currentDate);
    d.setHours(10 + Math.floor((tracker.commitsToday / tracker.targetCommitsToday) * 8), getRandomInt(0, 59), getRandomInt(0, 59));
    
    const dateStr = d.toISOString();
    
    const dateKey = dateStr.split('T')[0];
    if (!tracker.log[dateKey]) tracker.log[dateKey] = 0;
    tracker.log[dateKey]++;
    
    return dateStr;
}

const message = process.argv[2];
if (!message) {
    console.error("Please provide a commit message");
    process.exit(1);
}

const tracker = loadTracker();
const commitDate = getNextDate(tracker);

try {
    execSync('git commit -m "' + message + '" --no-verify', { 
        stdio: 'inherit', 
        env: { 
            ...process.env, 
            GIT_AUTHOR_DATE: commitDate, 
            GIT_COMMITTER_DATE: commitDate 
        } 
    });
    saveTracker(tracker);
    console.log("Committed backdated to: " + commitDate);
} catch (e) {
    console.error("Commit failed");
    process.exit(1);
}
