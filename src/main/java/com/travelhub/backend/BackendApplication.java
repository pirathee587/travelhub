package com.travelhub.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class BackendApplication {

	@org.springframework.beans.factory.annotation.Autowired
	private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@jakarta.annotation.PostConstruct
	public void fixDb() {
		try {
			jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS review_images (" +
					"id BIGSERIAL PRIMARY KEY," +
					"review_id BIGINT NOT NULL," +
					"image_url TEXT NOT NULL," +
					"CONSTRAINT fk_review_images_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE)");
			jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON review_images(review_id)");
			try { jdbcTemplate.execute("ALTER TABLE reviews ADD COLUMN user_name VARCHAR(255)"); } catch (Exception e) {}
			try { jdbcTemplate.execute("ALTER TABLE reviews ADD COLUMN title VARCHAR(255)"); } catch (Exception e) {}
			System.out.println("✅ DB SCHEMA FIX APPLIED SUCCESSFULLY");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
