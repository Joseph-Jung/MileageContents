const http = require('http');
const fs = require('fs');
const path = require('path');

function testServer() {
    console.log('🧪 Running tests for Airline Mileage Deals application...\n');
    
    const tests = [
        {
            name: 'Health endpoint test',
            url: 'http://localhost:3000/health',
            expectedStatus: 200
        },
        {
            name: 'Main page test',
            url: 'http://localhost:3000',
            expectedStatus: 200
        }
    ];
    
    let passed = 0;
    let total = tests.length;
    
    function runTest(test, callback) {
        const req = http.get(test.url, (res) => {
            if (res.statusCode === test.expectedStatus) {
                console.log(`✅ ${test.name} - PASSED`);
                passed++;
            } else {
                console.log(`❌ ${test.name} - FAILED (Expected ${test.expectedStatus}, got ${res.statusCode})`);
            }
            callback();
        });
        
        req.on('error', (err) => {
            console.log(`❌ ${test.name} - FAILED (${err.message})`);
            callback();
        });
        
        req.setTimeout(5000, () => {
            console.log(`❌ ${test.name} - FAILED (Timeout)`);
            req.destroy();
            callback();
        });
    }
    
    function runTests(index = 0) {
        if (index >= tests.length) {
            console.log(`\n📊 Test Results: ${passed}/${total} tests passed\n`);
            
            if (passed === total) {
                console.log('🎉 All tests passed! Application is working correctly.');
            } else {
                console.log('⚠️  Some tests failed. Please check the server is running with "npm start"');
            }
            return;
        }
        
        runTest(tests[index], () => {
            setTimeout(() => runTests(index + 1), 100);
        });
    }
    
    console.log('Testing file structure...');
    const requiredFiles = [
        'public/index.html',
        'public/styles.css',
        'public/app.js',
        'index.js',
        'package.json'
    ];
    
    let filesExist = true;
    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ File exists: ${file}`);
        } else {
            console.log(`❌ Missing file: ${file}`);
            filesExist = false;
        }
    });
    
    if (!filesExist) {
        console.log('\n❌ Some required files are missing. Cannot proceed with server tests.');
        return;
    }
    
    console.log('\n🌐 Testing server endpoints...');
    console.log('Note: Make sure to run "npm start" in another terminal first.\n');
    
    setTimeout(() => {
        runTests();
    }, 1000);
}

testServer();