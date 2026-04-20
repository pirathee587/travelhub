package com.travelhub.backend;

import com.travelhub.backend.config.RequiredEnvVarValidator;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		RequiredEnvVarValidator.validate();
		SpringApplication.run(BackendApplication.class, args);
	}

}
