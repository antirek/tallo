module.exports = {
    "port": 3000,
    "groups": [
        {
            "name": "group1",
            "servers": [

                {
                    "name": "1test",
                    "commands": [
                        {
                            "name": "test",
                            "run": "echo $test"
                        },
                        {
                            "name": "restart ast",
                            "run": "echo $run"
                        }
                    ]
                },
                {
                    "name": "1test2",
                    "commands": [
                        {
                            "name": "test2",
                            "run": "echo $test2"
                        },
                        {
                            "name": "restart2",
                            "run": "echo $run"
                        }
                    ]
                }
            ]
        },
        {
            "name": "group2",
            "servers": [
                {
                    "name": "2test",
                    "commands": [
                        {
                            "name": "test",
                            "run": "echo $test"
                        },
                        {
                            "name": "restart ast",
                            "run": "echo $run"
                        }
                    ]
                },
                {
                    "name": "2test2",
                    "commands": [
                        {
                            "name": "test2",
                            "run": "echo $test2"
                        },
                        {
                            "name": "restart2",
                            "run": "echo $run"
                        }
                    ]
                }
            ]
        }
    ],
    "users": [
        {
            "name": "test",
            "password": "password"
        }
    ]
};